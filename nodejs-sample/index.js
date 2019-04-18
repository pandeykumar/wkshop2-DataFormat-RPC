const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDefinition = protoLoader.loadSync('./proto/address.proto', {
  keepCase: true,
  longs: 'string',
  defaults: true
});
const proto = grpc.loadPackageDefinition(packageDefinition);

const contacts = [
  { id: '1', name: 'John Doe', address: '1 Sterling Way, CA 45532'},
  { id: '2', name: 'Jane Doe', address: '2 Sterling Way, CA 45532'}
]


const server = new grpc.Server();

server.addService(proto.test.ContactService.service, {
    list: (_, callback) => {
      console.log('contacts', contacts);
        return callback(null, {contacts});
    },
});

console.log('server', server);

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
console.log('Server running at http://0.0.0.0:50051')
server.start()
if(server.started) {
  console.log('server started....=======>>>>>>')
}
