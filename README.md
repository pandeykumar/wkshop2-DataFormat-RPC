# Data Formats and RPC Framework

####  What are the industry trends?
####  What problems are these trends trying to solve?


## Data Format - Protocol Buffers
* Binary format created by Google to serialize data between different services
* Like XML and JSON but smaller, faster, and simpler
* Works with structured data in a language and platform neutral way.
* Define data structure and generate code in java, c# , javascript, php, go etc to read and write
* Provides rules (structure validation) and tools to define and exchange these data structure commonly known as messages
* Validation is big for example if a Person message needs to always have first name then it can be specified in the message format. Now unlike JSON this validation doesn't have to be done on both client and server.

### Why not just use XML and JSON
Pros :  human readable, many libraries and tools in different languages
Cons :  resource intensive in encoding /decoding, verbose, does not easily support versioning etc.

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

***With gRPC we can define our service once in a .proto file and implement clients and servers in any of gRPC’s supported languages, which in turn can be run in environments ranging from servers inside Google to your own tablet - all the complexity of communication between different languages and environments is handled for you by gRPC.***

1. How google scaled internally and decided to open source it.
2. [HTTP+Json to gRPC journey](https://grpc.io/blog/vendastagrpc)
3. From publishing APIs and asking developers to integrate with them, to releasing SDKs and asking developers to copy-paste example code written in their language.
4.  Break free from the call-and-response architecture necessitated by HTTP + JSON. gRPC is built on top of HTTP/2, which allows for client-side and/or server-side streaming. Stream results as they become ready on the server (server-side streaming)
5. JSON to protocol buffers - explicit format specification of proto, meaning that clients receive typed objects rather than free-form JSON. Clients can reap the benefits of auto-completion in their IDEs, type-safety if their language supports it, and enforced compatibility between clients and servers with differing versions.
6. Simultaneously develop the client and the server side of our APIs! This means our latency to produce new APIs with the accompanying SDKs has dropped dramatically.


#### [More for Motivation and Principles](https://grpc.io/blog/principles)



## Example on Nodejs env.

![Plumbing](https://drive.google.com/uc?id=1OEEhr_YgWacAwkFHea0DR0XMBS5YYP80)

1. Create a directory (e.g) nodejs-samples and cd to it.
2. Run ```npm init```
3. Accept all the defaults and select yes on Is that OK?  
4. Run ```npm install grpc``` to install grpc package
   Also run ```npm install @grpc/proto-loader```
   [Details](https://www.npmjs.com/package/@grpc/proto-loader)
5. Declare proto file ***address.proto*** under proto directory and contact message
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
6. Run gRPC server locally. Create an ***index.js*** file

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
7. Create list RPC method and fetch Contacts in ***address.proto***

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
8. Lets add the ContactService to gRPC server in ***index.js*** using addService method
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

12. Run the client to invoke list service

 ``` node get_contacts.js```

  you should see the list of contacts defined printed in the console

  ```
successfully fetch List of contacts
{ contacts:
   [ { id: '1', Name: '', address: '1 Sterling Way, CA 45532' },
     { id: '2', Name: '', address: '2 Sterling Way, CA 45532' } ] }
  ```


## Exercises
1. Deploy the service in a docker container
2. Implement a add service to add a contact to the list
3. Generate C# client from address.proto and invoke list and add service


## dotnet client to call the gRPC service
This example uses the dotnet SDK in mac OSX , please adjust the instructions as needed for
other platforms.

OK, so one advantage of the gRPC is that based on the service defined in .proto
file, we can generate client sdk to access the service using many languages.
Lets try with c# and dotnet environment. We'll create a C# client and call the service running under nodejs in the previous section.

We assume that you have dotnet SDK installed -

```
$ dotnet --list-sdks
2.2.105 [/usr/local/share/dotnet/sdk]
```
You can follow this blog to get more details [gRPC-dotnet](https://grpc.io/blog/grpc-dotnet-build)

1. create a new dotnet console project called dotnetClient-sample and cd to it. Run this command under wkshop2-DataFormat-RPC folder to follow this example.

```
dotnet new console -n dotnetClient-sample

```
Here's my output -

```
$ dotnet new console -n dotnetClient-sample
The template "Console Application" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on dotnetClient-sample/dotnetClient-sample.csproj...
  Restoring packages for /Users/mymac/temp/wkshop2-DataFormat-RPC/dotnetClient-sample/dotnetClient-sample.csproj...
  Generating MSBuild file /Users/mymac/temp/wkshop2-DataFormat-RPC/dotnetClient-sample/obj/dotnetClient-sample.csproj.nuget.g.props.
  Generating MSBuild file /Users/mymac/temp/wkshop2-DataFormat-RPC/dotnetClient-sample/obj/dotnetClient-sample.csproj.nuget.g.targets.
  Restore completed in 267.19 ms for /Users/mymac/temp/wkshop2-DataFormat-RPC/dotnetClient-sample/dotnetClient-sample.csproj.

Restore succeeded.
```
Now cd to the new folder created

```
$ cd dotnetClient-sample/

```

2. Lets add Grpc package
```
$ dotnet add package Grpc
```
3. Lets add Grpc.Tools package
```
dotnet add package Grpc.Tools
```
4. Lets add package Google.Protobuf
```
dotnet add package Google.Protobuf
```
5. Lets specify the address.proto file that has the service and message definition.

In ***dotnetClient-sample.csproj*** file add Protobuf to ItemGroup.

```
<ItemGroup>
....
...
  <Protobuf Include="../nodejs-sample/proto/address.proto" />
</ItemGroup>  
```
6. Update Program.cs to make the client call to gRPC service
```
using System;
using Grpc.Core;
using Test;

namespace testclientgrpc
{
    class Program
    {
        static void Main(string[] args)
        {
            Channel channel = new Channel("127.0.0.1:50051", ChannelCredentials.Insecure);
            var client = new ContactService.ContactServiceClient(channel);
            var reply = client.list(new Test.Empty());
            Console.WriteLine("contacts: " + reply);

            channel.ShutdownAsync().Wait();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}

```
7. Run the client from wkshop2-DataFormat-RPC folder ( make sure you have the gRPC server running from the nodejs-sample in a separate window)
```
dotnet run -p dotnetClient-sample
```
you should see contact list as result -

```
$ dotnet run -p dotnetClient-sample
contacts: { "contacts": [ { "id": "1", "address": "1 Sterling Way, CA 45532" }, { "id": "2", "address": "2 Sterling Way, CA 45532" } ] }
Press any key to exit...
```
## Useful links

1. [Protocol Buffers](https://developers.google.com/protocol-buffers/)
2. [Json vs Protobuf](https://auth0.com/blog/beating-json-performance-with-protobuf/)
3. [gRPC](https://grpc.io/)
4. [Protobuf and c#](https://developers.google.com/protocol-buffers/docs/csharptutorial)
5. [Protobuf and c# examples](https://github.com/protocolbuffers/protobuf/tree/master/csharp)
6. [An Early Look at gRPC and ASP.NET Core 3.0](https://www.stevejgordon.co.uk/early-look-at-grpc-using-aspnet-core-3)
