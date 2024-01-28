# orgchart
Build Organization Chart API, stored in memory

### Getting Started

This app can be run through docker, here is how to run it:

##### 1. Clone this project
##### 2. Download docker
- Download docker desktop from https://www.docker.com/products/docker-desktop/ and install it.

##### 3. Build and run from docker
- Enter project's root folder via terminal
- run command:

```
docker compose up
```
- Docker compose will download and build necesary image.

##### 4. Unit test will run automatically
##### 5. Send JSON payload
- Submit JSON payload to `localhost:3000/v1/add`
- example:
```
{
    "id":1,
    "name":"arnold",
    "manager":2
}
```

##### 6. Run unit test manually
- run command inside terminal / cmd:
```
docker exec -it orgchart sh
```
- followed with this code:
```
npm test
```

## Build With
- [NodeJS](https://nodejs.org/)
- [Express](https://expressjs.com/)