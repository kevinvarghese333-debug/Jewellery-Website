# Hostinger VPS deployment

## Production architecture

The application is a frontend-only React/Vite/TypeScript site. GitHub Actions builds the static production bundle and deploys only the resulting `dist/` files. It does not run an application server, database, Docker build, or Docker Compose command on the VPS.

```text
Existing Traefik routing -> kavitha-jewellery-website-1 (nginx:alpine, port 8088) -> /var/www/kavitha-jewellery (read-only mount)
```

The existing website container mounts `/var/www/kavitha-jewellery` at `/usr/share/nginx/html:ro`. GitHub Actions updates that mounted directory in place; Nginx serves the new static files without restarting or recreating the container. The existing Traefik and Hermes Workspace containers are outside this deployment's scope and are never modified.

The existing container's Nginx configuration must implement SPA fallback, equivalent to `try_files $uri $uri/ /index.html;`. The workflow verifies this after upload with a request to `/spa-routing-check`; it fails if that request does not return the Vite app. This check is read-only and does not alter the container configuration.

The repository's `Dockerfile`, `docker-compose.yml`, and `nginx.conf` remain available for standalone Docker usage, but they are not used by this VPS deployment. Do not run the repository's Compose file on this VPS: its existing Compose project is `/docker/kavitha-jewellery`, and that stack must remain unchanged.

## Existing VPS configuration

| Item | Value |
| --- | --- |
| Operating system | Ubuntu 24.04.4 |
| Docker Compose | v5.4.0 |
| Existing web container | `kavitha-jewellery-website-1` |
| Container image | `nginx:alpine` |
| Existing host port | `8088` to container port `80` |
| Static-file directory | `/var/www/kavitha-jewellery` |
| Existing Compose directory | `/docker/kavitha-jewellery` |
| Existing Docker network | `kavitha-jewellery_default` |

Do not install host Nginx, expose ports, modify Traefik, modify DNS/HIOX, or run `docker compose up`, `docker compose down`, `docker restart`, or `docker rm` as part of this deployment.

## One-time VPS preparation

Run these commands as an administrator on the VPS. They create a dedicated deployment user and grant it write access only to the Kavitha static-site directory.

```sh
sudo adduser --disabled-password --gecos "" kavitha-deploy
sudo chown -R kavitha-deploy:kavitha-deploy /var/www/kavitha-jewellery
sudo find /var/www/kavitha-jewellery -type d -exec chmod 755 {} \;
sudo find /var/www/kavitha-jewellery -type f -exec chmod 644 {} \;
```

The workflow checks the existing Nginx container with `docker inspect` but never changes it. Grant the deployment user access only to that read-only command by creating `/etc/sudoers.d/kavitha-deploy` with this exact content:

```sudoers
kavitha-deploy ALL=(root) NOPASSWD: /usr/bin/docker inspect --format * kavitha-jewellery-website-1
```

Validate the sudoers file before relying on it:

```sh
sudo visudo -cf /etc/sudoers.d/kavitha-deploy
sudo -iu kavitha-deploy sudo /usr/bin/docker inspect --format '{{.State.Running}}' kavitha-jewellery-website-1
```

## SSH deployment key

Create a dedicated Ed25519 key pair on a trusted administrator computer. Do not create it in this repository and never copy its private key to the VPS.

```sh
ssh-keygen -t ed25519 -f ./github-actions-kavitha -C github-actions-kavitha
```

Install the public key on the VPS for `kavitha-deploy`:

```sh
sudo -iu kavitha-deploy mkdir -p /home/kavitha-deploy/.ssh
sudo -iu kavitha-deploy chmod 700 /home/kavitha-deploy/.ssh
sudo -iu kavitha-deploy sh -c 'cat >> /home/kavitha-deploy/.ssh/authorized_keys'
sudo -iu kavitha-deploy chmod 600 /home/kavitha-deploy/.ssh/authorized_keys
```

When the third command waits for input, paste the contents of `github-actions-kavitha.pub`, press Enter, then press Ctrl+D. Test the connection before configuring GitHub Actions:

```sh
ssh -i ./github-actions-kavitha kavitha-deploy@YOUR_VPS_IP
```

## GitHub Actions setup

Add these repository Actions secrets. They are the only SSH credentials used by the workflow.

| Secret | Value |
| --- | --- |
| `VPS_HOST` | The VPS public IP address or hostname. |
| `VPS_USER` | `kavitha-deploy`. |
| `VPS_SSH_PRIVATE_KEY` | The private content of the dedicated Ed25519 key. |
| `VPS_SSH_KNOWN_HOSTS` | The VPS host key produced by `ssh-keyscan -H YOUR_VPS_IP` from a trusted machine. |

The workflow is deliberately disabled until you create the repository Actions variable `ENABLE_VPS_DEPLOY` with the value `true`. Do this only after completing the one-time VPS preparation and manually verifying the website. Until then, pushes to `main` do not deploy anything.

## Deployment workflow

`.github/workflows/deploy-vps.yml` runs on `main` pushes and manual dispatches, subject to the opt-in variable. It performs these steps:

1. Runs `npm ci`, `npm run lint`, and `npm run build` in GitHub Actions.
2. Confirms `dist/index.html` exists.
3. Connects as the dedicated deployment user and verifies that the target directory is writable and `kavitha-jewellery-website-1` is already running.
4. Uses `rsync` to copy only `dist/` to `/var/www/kavitha-jewellery/`. `--delay-updates` and `--delete-delay` reduce the chance of a partially updated asset set.
5. Verifies the deployed `index.html`, JavaScript assets, running container, normal local website response, and SPA fallback response on port `8088`.

The workflow does not connect to Vercel, modify Traefik, restart containers, use `/docker/kavitha-jewellery`, or interact with Hermes Workspace.

## Manual deployment and checks

For a first manual update from a trusted computer, run the build locally and use the same restricted deployment user:

```sh
npm ci
npm run lint
npm run build
rsync -az --delete-delay --delay-updates dist/ kavitha-deploy@YOUR_VPS_IP:/var/www/kavitha-jewellery/
```

Then verify safely on the VPS:

```sh
test -s /var/www/kavitha-jewellery/index.html
sudo -iu kavitha-deploy sudo /usr/bin/docker inspect --format '{{.State.Running}}' kavitha-jewellery-website-1
curl -I http://127.0.0.1:8088/
```

## Rollback

GitHub Actions deploys static files, so keep a local copy of a known-good `dist/` directory or rebuild a previous Git commit. Then upload that previous bundle with the same `rsync` command. This does not require or permit container restarts.

```sh
git checkout COMMIT_SHA
npm ci
npm run build
rsync -az --delete-delay --delay-updates dist/ kavitha-deploy@YOUR_VPS_IP:/var/www/kavitha-jewellery/
git checkout main
```

## Troubleshooting

Run these read-only checks on the VPS:

```sh
ls -lah /var/www/kavitha-jewellery
sudo -iu kavitha-deploy sudo /usr/bin/docker inspect --format '{{.State.Running}}' kavitha-jewellery-website-1
curl -v http://127.0.0.1:8088/
docker compose -f /docker/kavitha-jewellery/docker-compose.yml ps
```

If a GitHub Actions deployment fails, no container is restarted. Check whether the deployment user can write `/var/www/kavitha-jewellery`, whether its SSH key is installed, whether the `VPS_SSH_KNOWN_HOSTS` secret matches the VPS host key, and whether the website container was already running before the upload.
