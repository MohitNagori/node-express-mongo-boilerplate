# Pull the Docker image of node from docker hub
FROM node:carbon-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy the package.json file into the directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code only as we have added the `node_modules` in .dockerignore
COPY . .

# Expose port and start application
EXPOSE 3000

# Start service
CMD [ "npm", "start" ]