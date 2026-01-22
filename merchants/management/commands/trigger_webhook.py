from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from merchants.models import WebhookConfiguration, WebhookLog
import json
import requests
from django.utils import timezone
from datetime import timedelta
import hmac
import hashlib

class Command(BaseCommand):
    help = 'Trigger webhook for testing purposes'

    def add_arguments(self, parser):
        parser.add_argument('user_id', type=str, help='User ID')
        parser.add_argument('event_type', type=str, help='Event type')
        parser.add_argument('payload', type=str, help='JSON payload')

    def handle(self, *args, **options):
        user_id = options['user_id']
        event_type = options['event_type']
        payload_str = options['payload']
        
        try:
            # Get user and webhook config
            user = User.objects.get(id=user_id)
            config = WebhookConfiguration.objects.filter(merchant=user).first()
            
            if not config:
                self.stdout.write(
                    self.style.ERROR(f'No webhook configuration found for user {user_id}')
                )
                return
            
            # Parse payload
            payload = json.loads(payload_str)
            
            # Create webhook log
            start_time = timezone.now()
            webhook_log = WebhookLog.objects.create(
                config=config,
                event_type=event_type,
                url=config.webhook_url,
                payload=payload
            )
            
            # Generate signature
            def generate_webhook_signature(payload, secret):
                payload_str = json.dumps(payload, sort_keys=True)
                return hmac.new(
                    secret.encode('utf-8'),
                    payload_str.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()
            
            # Send webhook
            headers = {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': generate_webhook_signature(payload, config.webhook_secret),
                'X-Webhook-Event': event_type,
                'User-Agent': 'RouteBase-Webhook/1.0'
            }
            
            response = requests.post(
                config.webhook_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            # Update webhook log
            response_time = (timezone.now() - start_time).total_seconds() * 1000
            
            webhook_log.response_status = response.status_code
            webhook_log.response_body = response.text
            webhook_log.response_time_ms = int(response_time)
            webhook_log.status = 'DELIVERED' if response.status_code == 200 else 'FAILED'
            webhook_log.delivered_at = timezone.now() if response.status_code == 200 else None
            webhook_log.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Webhook {event_type} triggered for user {user_id}. '
                    f'Status: {webhook_log.status}, Response: {response.status_code}'
                )
            )
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User {user_id} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error triggering webhook: {str(e)}')
            )
