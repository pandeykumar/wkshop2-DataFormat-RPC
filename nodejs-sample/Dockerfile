# This image comes with Node.js and NPM already installed
FROM node:11-alpine

# Create app directory
WORKDIR /nodejs-sample

# Copy everything from this folder onwards to working directory
COPY . /nodejs-sample

RUN npm install grpc

RUN npm install @grpc/proto-loader

CMD ["node", "index.js"]
