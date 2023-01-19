# Quick Start

```shell
# Load ENV
export $(grep -v '^#' .env | xargs)
# Start database
yarn database:dev:start
# Initialize database
yarn prisma format && yarn prisma migrate reset --force && yarn prisma generate && yarn prisma db push && yarn database:dev:seed
#Serve locally
yarn build:ncc:local && yarn sls offline
```

### Browse the DB via a UI

```shell
yarn prisma studio
```

# Example Commands

```shell
# Start an empty local database instance
yarn database:dev:start
```

```shell
# Stop local database instance
yarn database:dev:stop
```

### Generate Artifacts

```shell
yarn prisma generate
```

### Creating a Migration

```shell
yarn prisma migrate dev
```

### Apply the migration(s)

```shell
yarn prisma db push
```

## REST API

### Configuration

Add the `DATABASE_URL` environment variable into the serverless.yml.

### Build Lambda Handlers

```sh
yarn build:ncc
```

### Deploy to AWS

```sh
yarn sls deploy
```

<img width="577" alt="image" src="https://user-images.githubusercontent.com/64153133/213377056-6842e186-999b-4ae3-981e-6813f00a6dae.png">

