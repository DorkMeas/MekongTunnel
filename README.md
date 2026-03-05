# MekongTunnel (Node.js)

Pure JavaScript/Node.js version of MekongTunnel.

## Run

```bash
npm test
npm start
```

Env:
- `PORT` (default `8080`)
- `DOMAIN` (default `localhost`)

## API

- `GET /health`
- `GET /tunnels`
- `POST /tunnels` with JSON body `{ "localPort": 3000 }`
- `DELETE /tunnels/:subdomain`

Example:

```bash
curl -X POST http://localhost:8080/tunnels \
  -H 'content-type: application/json' \
  -d '{"localPort":3000}'
```
