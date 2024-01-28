FROM node:19-alpine
WORKDIR /app 
COPY package*.json ./ 
RUN npm install 
COPY . . 
ENTRYPOINT npm test && npm start