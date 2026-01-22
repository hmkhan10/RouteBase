FROM python:3.9-slim
WORKDIR /app
RUN pip install requests
COPY init.py .
# The -u flag ensures real-time log output to terminal
CMD ["python", "-u", "init.py"]