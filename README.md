
# MekongTunnel (Pure Node.js)

នេះជា MekongTunnel version ដែលសរសេរ​ដោយ Node.js សុទ្ធ ហើយអាចប្រើជាក់ស្តែងសម្រាប់គ្រប់គ្រង tunnel records និង proxy request ទៅ local service។

## Requirements

- Node.js `>= 20`

## Start

```bash
npm test
npm start
```

Default env:
- `PORT=8080`
- `DOMAIN=localhost`
- `DATA_FILE=.data/tunnels.json`

## API

### Health

```bash
curl http://127.0.0.1:8080/health
```

### Create tunnel

```bash
curl -X POST http://127.0.0.1:8080/tunnels \
  -H 'content-type: application/json' \
  -d '{"localHost":"127.0.0.1","localPort":3000}'
```

### List tunnels

```bash
curl http://127.0.0.1:8080/tunnels
```

### Delete tunnel

```bash
curl -X DELETE http://127.0.0.1:8080/tunnels/<subdomain>
```

### Proxy traffic to local target

After creating a tunnel, call:

```bash
curl http://127.0.0.1:8080/proxy/<subdomain>/api/ping
```

This forwards the request to `http://localHost:localPort/api/ping` of that tunnel target.

## Docker

```bash
docker compose up --build
```


## Resolve GitHub merge conflicts (CLI)

If GitHub shows conflicts on these files:
- `.env.example`
- `README.md`
- `docker-compose.yml`
- `src/server.js`
- `src/tunnels.js`
- `test/tunnels.test.js`

Use:

```bash
# after starting a merge/rebase and conflicts appear
scripts/resolve-pr-conflicts.sh ours
# then
git commit
```

If you want to keep target-branch versions instead, run `scripts/resolve-pr-conflicts.sh theirs`.
=======
