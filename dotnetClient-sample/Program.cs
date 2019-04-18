using System;
using Grpc.Core;
using Test;

namespace testclientgrpc
{
    class Program
    {
        static void Main(string[] args)
        {
            Channel channel = new Channel("0.0.0.0:50051", ChannelCredentials.Insecure);
            var client = new ContactService.ContactServiceClient(channel);
            var reply = client.list(new Test.Empty());
            Console.WriteLine("contacts: " + reply);

            channel.ShutdownAsync().Wait();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}
