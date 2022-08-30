FROM node:14.0-slim
WORKDIR /app
COPY . .
RUN npm install
CMD [ "npm", "start" ]