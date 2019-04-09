const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './proto/address.proto'
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: 'string',
  defaults: true
});

const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.test.ContactService('0.0.0.0:50051',
    grpc.credentials.createInsecure())

    console.log('client', client);
module.exports = client;
