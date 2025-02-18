FROM node:20
ENV NODE_ENV=production

WORKDIR /src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 8081

CMD [ "node", "index.js" ]