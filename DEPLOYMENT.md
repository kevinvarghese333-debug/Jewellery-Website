# Docker deployment on a Hostinger VPS

## Application and architecture

This repository builds to static HTML, CSS, and JavaScript. It has no backend server, database, API routes, or required runtime environment variables. The current cart and gold-rate settings are stored in the visitor's browser. The product data is bundled with the application; some images, fonts, maps, and WhatsApp links load from third-party services.

The `express`, `dotenv`, and `@google/genai` packages, plus the variables in `.env.example`, are not referenced by the application. They do not need to be configured for this deployment. Do not add API keys to the VPS, Git repository, Docker image, or `VITE_*` variables.

Production traffic flows as follows:

```text
Internet (HTTPS) -> host Nginx -> 127.0.0.1:8080 -> Docker Nginx -> Vite SPA
```

The Docker container serves the static Vite `dist` output. Its Nginx configuration has a `/healthz` endpoint and falls back to `index.html`, so direct links and browser refreshes work with client-side routing.

## VPS prerequisites

These commands assume an Ubuntu Hostinger KVM VPS. Update the operating system first, then install Docker Engine with the Compose plugin and Nginx. Follow Docker's official installation instructions for a Debian or other operating-system version.

```sh
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git nginx
```

Install Docker Engine and the Docker Compose plugin:

```sh
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker --version
docker compose version
```

Allow only web traffic through the VPS firewall. The application container itself stays private on `127.0.0.1:8080`.

```sh
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Deployment user and directory

Create a dedicated, non-root deployment user and give it access to Docker. Log out and back in after adding the user to the Docker group before using Docker as that user.

```sh
sudo adduser deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy /opt/kavitha-jewellery
```

The GitHub Actions workflow and the commands below use `/opt/kavitha-jewellery`. Do not place production configuration or secrets in this repository directory.

## Clone and first start

Become the deployment user, clone the repository into the expected directory, then build and start only this Compose service:

```sh
sudo -iu deploy
git clone https://github.com/kevinvarghese333-debug/Jewellery-Website.git /opt/kavitha-jewellery
cd /opt/kavitha-jewellery
docker compose build --pull
docker compose up -d jewellery-website
```

Check the running container, application logs, and private health endpoint:

```sh
docker compose ps
docker compose logs --tail=100 jewellery-website
curl -I http://127.0.0.1:8080/healthz
```

To use a different local port, set `HOST_PORT` when starting the service, for example `HOST_PORT=8081 docker compose up -d --build jewellery-website`. Update the host Nginx proxy target to match.

## Host Nginx, domain, and HTTPS

Create `/etc/nginx/sites-available/jewellery-website` as root, replacing `example.com` with the real domain. The host Nginx server is the only public-facing service and forwards requests to the private Docker port.

```nginx
server {
    listen 80;
    listen [::]:80;
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

Enable the site, test Nginx, and reload it:

```sh
sudo ln -s /etc/nginx/sites-available/jewellery-website /etc/nginx/sites-enabled/jewellery-website
sudo nginx -t
sudo systemctl reload nginx
```

After the domain's DNS records point to the VPS, install Certbot and request a certificate:

```sh
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo systemctl status certbot.timer
```

Do not expose port `8080` in the VPS firewall. Do not modify Vercel, DNS, or other VPS applications while completing this setup.

## GitHub Actions automatic deployment

The workflow at `.github/workflows/deploy-vps.yml` is triggered after a push to `main` or when started manually, but it will deploy only after the repository Actions variable `ENABLE_VPS_DEPLOY` is set to `true`. This prevents the initial workflow commit from deploying before the VPS is ready. It connects over SSH, runs `git pull --ff-only`, rebuilds and restarts only the `jewellery-website` Compose service, confirms it is running, and checks `/healthz`. It does not interact with Vercel, Hermes Workspace, or unrelated Docker containers.

Create the following GitHub Actions repository secrets before enabling automatic deployment:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS public IP address or hostname. |
| `VPS_USER` | `deploy`. |
| `VPS_SSH_PRIVATE_KEY` | Private half of the dedicated Ed25519 deployment key. |
| `VPS_SSH_KNOWN_HOSTS` | The VPS SSH host-key line, generated with `ssh-keyscan -H YOUR_VPS_IP` from a trusted machine. |

Create the repository Actions variable `ENABLE_VPS_DEPLOY` with the value `true` only after completing the manual VPS deployment and validating the site. This variable is not a secret.

Create a dedicated key pair on a trusted administrator computer. Do not create it inside the repository and never copy the private key to the VPS.

```sh
ssh-keygen -t ed25519 -f ./github-actions-kavitha -C github-actions-kavitha
```

Install the public key for the deployment user on the VPS, then lock down the SSH permissions:

```sh
sudo -iu deploy mkdir -p /home/deploy/.ssh
sudo -iu deploy chmod 700 /home/deploy/.ssh
sudo -iu deploy sh -c 'cat >> /home/deploy/.ssh/authorized_keys'
sudo -iu deploy chmod 600 /home/deploy/.ssh/authorized_keys
```

When the third command waits for input, paste the content of `github-actions-kavitha.pub`, press Enter, then press Ctrl+D. Copy the private key file into the `VPS_SSH_PRIVATE_KEY` GitHub secret and the `ssh-keyscan` output into `VPS_SSH_KNOWN_HOSTS`.

## Manual updates and rollback

For a manual update, run as the `deploy` user:

```sh
cd /opt/kavitha-jewellery
git pull --ff-only origin main
docker compose build --pull
docker compose up -d jewellery-website
docker compose ps
```

To roll back to a previously known commit, replace `COMMIT_SHA` with its commit ID, rebuild, and restart the same service:

```sh
cd /opt/kavitha-jewellery
git checkout COMMIT_SHA
docker compose up -d --build jewellery-website
curl -I http://127.0.0.1:8080/healthz
```

Before the next automatic deployment, return the server checkout to `main`:

```sh
git checkout main
git pull --ff-only origin main
```

## Troubleshooting

```sh
docker compose ps
docker compose logs --tail=200 jewellery-website
docker compose exec jewellery-website nginx -t
curl -v http://127.0.0.1:8080/healthz
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
git status
```

If GitHub Actions fails, check its job log first. On the VPS, confirm the repository is at `/opt/kavitha-jewellery`, the `deploy` user belongs to the `docker` group, the public key is in `/home/deploy/.ssh/authorized_keys`, and the `VPS_SSH_KNOWN_HOSTS` secret matches the VPS host key.
