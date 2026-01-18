import requests
import threading
import time
import random
import string
import sys

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
CONCURRENCY_LEVEL = 50  # Increased to 50 for "The Rush"
TOTAL_REQUESTS = 200    # Total requests for rate limit testing

# Endpoints to test
GET_ENDPOINTS = [
    "/",
    "/api/health/",
    "/api/hello/",
    "/api/merchants/",
    "/register/",
    "/login/",
    "/admin/",
    "/dashboard/",
]

def generate_attack_payloads():
    """Generates malicious payloads for security testing."""
    return [
        {"username": "admin' OR '1'='1", "password": "password"}, # SQL Injection
        {"username": "<script>alert('XSS')</script>", "password": "password"}, # XSS
        {"username": "user", "password": "password", "email": "test@example.com", "extra": "A" * 10000}, # Buffer Overflow attempt
    ]

def check_endpoint(url, method="GET", data=None, cookies=None):
    try:
        if method == "GET":
            response = requests.get(url, cookies=cookies, timeout=10, allow_redirects=False)
        else:
            response = requests.post(url, data=data, cookies=cookies, timeout=10, allow_redirects=False)
        return response.status_code, len(response.content)
    except Exception as e:
        return "ERROR", str(e)

def phase_1_bridge_check():
    print("\n--- Phase 1: Environment & Bridge Check ---")
    status, _ = check_endpoint(BACKEND_URL + "/api/health/")
    print(f"Backend Health Check: {status}")
    status, _ = check_endpoint(FRONTEND_URL)
    print(f"Frontend Health Check: {status}")

def phase_2_extreme_rush():
    print(f"\n--- Phase 2: The Rush ({CONCURRENCY_LEVEL} concurrent threads) ---")
    
    errors = 0
    successes = 0
    
    def stress_worker():
        nonlocal errors, successes
        try:
            # Mix of valid and invalid requests
            url = BACKEND_URL + random.choice(GET_ENDPOINTS)
            status, _ = check_endpoint(url)
            if status in [200, 301, 302, 404, 405]: # Expected codes
                successes += 1
            elif status == 429: # Rate limited (Good!)
                successes += 1
            else:
                errors += 1
                print(f"Error on {url}: {status}")
        except:
            errors += 1

    threads = []
    start_time = time.time()
    for _ in range(CONCURRENCY_LEVEL):
        t = threading.Thread(target=stress_worker)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    
    duration = time.time() - start_time
    print(f"Completed {CONCURRENCY_LEVEL} requests in {duration:.2f}s")
    print(f"Successes: {successes}, Errors (Crashes): {errors}")

def phase_3_security_attack():
    print("\n--- Phase 3: Extreme Security Attack ---")
    
    # 1. SQL Injection & XSS
    print("Testing Injection Attacks on /register/...")
    payloads = generate_attack_payloads()
    for i, payload in enumerate(payloads):
        status, _ = check_endpoint(BACKEND_URL + "/register/", method="POST", data=payload)
        if status == 403:
            print(f"[PASS] WAF/Server blocked payload {i} (Status 403)")
        else:
            print(f"[WARN] Payload {i} returned status {status}")

    # 2. Rate Limiting Test
    print("\nTesting Rate Limiting (Spamming /api/hello/)...")
    limit_hit = False
    for i in range(50):
        status, _ = check_endpoint(BACKEND_URL + "/api/hello/")
        if status == 429:
            print(f"[PASS] Rate limit hit after {i} requests (Status 429)")
            limit_hit = True
            break
    
    if not limit_hit:
        print("[FAIL] Rate limit NOT hit after 50 requests")

    # 3. CSRF Check
    print("\nTesting CSRF Protection...")
    # Try POST without CSRF token
    status, _ = check_endpoint(BACKEND_URL + "/register/", method="POST", data={"username": "test"})
    if status == 403:
        print("[PASS] CSRF protection active (Status 403)")
    else:
        print(f"[FAIL] CSRF protection bypassed? (Status {status})")

if __name__ == "__main__":
    try:
        phase_1_bridge_check()
        phase_2_extreme_rush()
        phase_3_security_attack()
    except KeyboardInterrupt:
        print("\nStress test aborted.")
