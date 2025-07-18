# ---------- secure runtime image ----------
FROM python:3.12-slim

# Security hardening
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r -g 1000 appuser \
    && useradd -r -u 1000 -g 1000 -d /app -s /sbin/nologin appuser \
    && mkdir -p /app /tmp/secure_workspaces \
    && chmod 755 /app \
    && chmod 1777 /tmp/secure_workspaces

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

# Remove unnecessary packages and clean up
RUN apt-get autoremove -y && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Restrict file permissions
RUN chmod 644 server.py requirements.txt \
    && chown -R 1000:1000 /app

# Switch to non-root user
USER 1000:1000

# Security environment variables
ENV PORT=8080
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONHASHSEED=random

# Container security options (to be used with docker run)
# --security-opt=no-new-privileges:true
# --cap-drop=ALL
# --read-only
# --tmpfs /tmp:noexec,nosuid,size=100m

EXPOSE 8080
CMD ["python", "server.py"]


