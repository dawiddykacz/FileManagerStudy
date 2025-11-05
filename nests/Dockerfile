FROM node:18

WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/sqlite

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
