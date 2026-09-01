import socket

for port in [80, 8000, 5432, 6379]:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    result = s.connect_ex(('127.0.0.1', port))
    status = "OPEN (Listening)" if result == 0 else f"CLOSED ({result})"
    print(f"Port {port}: {status}")
    s.close()
