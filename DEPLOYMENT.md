# Docker deployment on a Hostinger VPS

## Application requirements

This repository builds to static HTML, CSS, and JavaScript. It has no backend server, database, API routes, or required runtime environment variables. The current cart and gold-rate settings are stored in the visitor's browser. The product data is bundled with the application; some images, fonts, maps, and WhatsApp links load from third-party services.

The `express`, `dotenv`, and `@google/genai` packages, plus the variables in `.env.example`, are not referenced by the app. They do not need to be configured for this deployment.

## First deployment

1. Install Docker Engine and the Docker Compose plugin on the VPS.
2. Clone the repository and enter it:

   ```sh
   git clone https://github.com/kevinvarghese333-debug/Jewellery-Website.git
   cd Jewellery-Website
   ```

3. Build and start the site:

   ```sh
   docker compose up -d --build
   ```

4. Confirm the container is healthy:

   ```sh
   docker compose ps
   curl -I http://127.0.0.1:8080/healthz
   ```

The Compose configuration binds the container to `127.0.0.1:8080`, keeping it private to the VPS so the host Nginx server can safely proxy public traffic. To use another local port, set `HOST_PORT` before starting it, for example `HOST_PORT=8081 docker compose up -d --build`.

## Domain and HTTPS

Configure the host Nginx server with the following site definition, replacing `example.com` with the production domain. Keep the application container on `127.0.0.1:8080`; Nginx accepts public traffic on ports `80` and `443` and forwards requests locally.

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After DNS for the domain points to the VPS, enable TLS with Certbot (or the preferred certificate provider) and allow only ports `80` and `443` through the VPS firewall. The Docker application port remains private.

## Updating

```sh
git pull --ff-only
docker compose up -d --build
docker image prune -f
```

The Nginx configuration includes a `/healthz` endpoint and SPA fallback, so direct links and browser refreshes continue to serve the React application.
