# Data Formats and RPC Framework

####  What are the industry trends?
####  What problems are these trends trying to solve?


## Data Format - Protocol Buffers
* Binary format created by Google to serialize data between different services
* Like XML and JSON but smaller, faster, and simpler
* Works with structured data in a language and platform neutral way.
* Define data structure and generate code in java, c# , javascript, php, go etc to read and write
* Provides rules (structure validation) and tools to define and exchange these data structure commonly known as messages
* Validation is big for example if a Person message needs to have always have first name then it can be specified in the message format. Now unlike JSON this validation doesn't have to be done on both client and server.

### Why not just use XML and JSON
Pros :  human readable, many libraries and tools in different languages
Cons :  resource intensive in encoding /decoding, verbose,

***Protobuf performs upto 6 times faster than JSON!***

### Protobuf cons:
1. Non human readable as the message is in binary Format
2. No extensive documentation
3. A lot depends on open source community so have to change the mindset to work in open source environment.

### How do you work with it
1. Define your data structure or message ( message descriptors) in .proto file
2. Generate classes/objects to deal with data in the chosen programming language
2. Use parsing and serialization tools as per the preferred language to create, read and write these messages - parsing and serialization

```
message Person {
  required string name = 1;
  required int32 id = 2;
  optional string email = 3;
}
```

We will use use protobuf with a grpc service ..  

## RPC Framework - gRPC
### Why gRPC?

1.
#### [More for Motivation and Principles](https://grpc.io/blog/principles)


## Example
1. Create a directory (e.g) nodejs-samples and cd to it.
2. Run ```npm init```
3. Accept all the defaults and select yes on Is that OK?  
4. Run ```npm install grpc``` to install grpc package
   Also run ```npm install @grpc/proto-loader```
   [Details](https://www.npmjs.com/package/@grpc/proto-loader)
5. Declare proto file address.proto under proto directory and contact message
```
  syntax = "proto3";
  package test;

  message Empty {}

  message Contact {
      string id = 1;
      string Name = 2;
      string address = 3;
  }

  message ContactList {
     repeated Contact contacts = 1;
  }
```
6. Run gRPC server locally. Create an index.js file

 ```
    const grpc = require('grpc')
    const protoLoader = require('@grpc/proto-loader')
    const packageDefinition = protoLoader.loadSync('./proto/notes.proto', {
      keepCase: true,
      longs: 'string',
      defaults: true
    });
    const proto = grpc.loadPackageDefinition(packageDefinition);
    const server = new grpc.Server()

    console.log('server', server);

    server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
    console.log('Server running at http://127.0.0.1:50051')
    server.start()
    if(server.started) {
      console.log('server started....=======>>>>>>')
    }
 ```
7. Create list RPC method and fetch Contacts in address.proto

 ```
  syntax = "proto3";

  package test;

  service ContactService {
      rpc list (Empty) returns (ContactList) {}
  }
  message Empty {}

  message Contact {
      string id = 1;
      string Name = 2;
      string address = 3;
  }

  message ContactList {
     repeated Contact contacts = 1;
  }
 ```
8. Lets add the ContactService to gRPC server in index.js using addService methods

```
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


  const server = new grpc.Server()
  server.addService(proto.test.ContactService.service, {
      list: (_, callback) => {
        console.log('contacts', contacts);
          return callback(null, {contacts});
      },
  });

  console.log('server', server);

  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
  console.log('Server running at http://127.0.0.1:50051')
  server.start()
  if(server.started) {
    console.log('server started....=======>>>>>>')
  }
```
9. Lets create a client to call our list() gRPC service in client.js

  ```
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
  ```
10. Lets create a new js file get_contacts.js to call the client to get contacts.

  ```
const client = require('./client')
console.log('client', client)
client.list({}, (error, contacts) => {
    if (!error) {
        console.log('successfully fetch List of contacts')
        console.log(contacts)
    } else {
        console.error('Some error !!!')
        console.error(error)
    }
})
  ```

11. Lets start the server under nodejs-samples
  ``` node index.js ```

This should start a gRPC server with console output like so -

  ```
  Server running at http://127.0.0.1:50051
  server started....=======>>>>>>
```

## Useful links

1.[Protocol Buffers](https://developers.google.com/protocol-buffers/)
2.[Protobuf and c#](https://developers.google.com/protocol-buffers/docs/csharptutorial)
3.[Json vs Protobuf](https://auth0.com/blog/beating-json-performance-with-protobuf/)
4.[gRPC](https://grpc.io/)
5.[An Early Look at gRPC and ASP.NET Core 3.0](https://www.stevejgordon.co.uk/early-look-at-grpc-using-aspnet-core-3)
