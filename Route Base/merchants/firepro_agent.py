import os
import time
import requests
import json
import logging
import platform
from datetime import datetime

# Configure Professional Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - FIREPRO-SDK - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FireProEnterpriseSDK:
    def __init__(self):
        # Credentials from Docker Environment
        self.node_id = os.getenv('NODE_ID', 'UNKNOWN_NODE')
        self.auth_token = os.getenv('AUTH_TOKEN')
        self.api_endpoint = "https://your-firepro-domain.com/api/v1/uplink/"
        
        # Mapping configuration
        self.target_dir = '/corp_data'
        self.ignored_dirs = {'.git', 'node_modules', '__pycache__', '.venv', 'dist'}
        
        # System Info for Dashboard
        self.os_info = f"{platform.system()} {platform.release()}"

    def scan_assets(self):
        """Deep scans the directory for high-value software assets."""
        assets = []
        try:
            for root, dirs, files in os.walk(self.target_dir):
                # Efficiently skip heavy/irrelevant folders
                dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
                
                for file in files:
                    if file.endswith(('.py', '.js', '.exe', '.sh', '.bin', '.go', '.rs')):
                        full_path = os.path.join(root, file)
                        # Get relative path for privacy/UI clarity
                        rel_path = os.path.relpath(full_path, self.target_dir)
                        
                        assets.append({
                            "name": file,
                            "path": rel_path,
                            "size_kb": round(os.path.getsize(full_path) / 1024, 2),
                            "last_modified": datetime.fromtimestamp(os.path.getmtime(full_path)).isoformat()
                        })
        except Exception as e:
            logger.error(f"Scan failed: {e}")
        
        # Sort by most recently modified and return top 50
        return sorted(assets, key=lambda x: x['last_modified'], reverse=True)[:50]

    def get_system_metrics(self):
        """Gathers server health data for the 'Node Health' dashboard."""
        return {
            "load_avg": os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0],
            "os": self.os_info,
            "scan_timestamp": datetime.now().isoformat()
        }

    def sync(self):
        """The core uplink mechanism."""
        if not self.auth_token:
            logger.critical("No AUTH_TOKEN found. Uplink aborted.")
            return

        logger.info(f"Initiating Sync for Node: {self.node_id}")
        
        # Build the Deep Data Packet
        payload = {
            "node_id": self.node_id,
            "token": self.auth_token,
            "metadata": {
                "corp_folder_name": os.path.basename(os.getcwd()),
                "metrics": self.get_system_metrics(),
            },
            "data": {
                "software_inventory": self.scan_assets(),
                # This logic can be expanded to scan git configs for real names
                "active_nodes": len(self.scan_assets()) 
            }
        }

        try:
            response = requests.post(
                self.api_endpoint,
                json=payload,
                headers={"Content-Type": "application/json", "User-Agent": "FirePro-SDK-v1.0"},
                timeout=15
            )
            
            if response.status_code == 200:
                logger.info("✅ Sync Successful. Dashboard updated.")
            else:
                logger.warning(f"⚠️ Server rejected sync: {response.status_code} - {response.text}")
        
        except requests.exceptions.ConnectionError:
            logger.error("❌ Failed to connect to FirePro Cloud. Retrying in 30s...")
        except Exception as e:
            logger.error(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    logger.info("=== FIREPRO ENTERPRISE SDK STARTING ===")
    sdk = FireProEnterpriseSDK()
    
    # Standard Production Loop
    while True:
        sdk.sync()
        # Real-time feel but respectful of server resources (Sync every 30-60 seconds)
        time.sleep(60)