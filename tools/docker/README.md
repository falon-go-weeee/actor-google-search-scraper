## Development

### How to start?

- Copy `.env.exmaple` file and update with your setting

```sh
cp .env.exmaple .env
```

- Create actor's input file and update with all needed parameters

```
mkdir -p apify_storage/key_value_stores/default && touch $_/INPUT.json
```

- Run docker-compose to execute actor in container

```sh
docker-compose up
```

### Test

- Run docker-compose to execute test in container

```sh
docker-compose run node npm run test
```
