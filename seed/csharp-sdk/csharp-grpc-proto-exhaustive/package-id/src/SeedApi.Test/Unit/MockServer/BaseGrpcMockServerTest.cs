using Google.Protobuf;
using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using System.Text.Json.Nodes;

namespace SeedApi.Test.Unit.MockServer;

public class BaseGrpcMockServerTest
{
    private GrpcMockServer _mock = null!;

    protected DataServiceStub DataServiceStub { get; set; } = null!;

    protected SeedApiClient Client { get; set; } = null!;

    [OneTimeSetUp]
    public async Task GlobalSetup()
    {
        DataServiceStub = new DataServiceStub();

        _mock = await GrpcMockServerBuilder
            .Configure()
            .WithService<Data.V1.Grpc.DataService.DataServiceBase>(DataServiceStub)
            .BuildAsync();

        Client = new SeedApiClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "http://localhost",
                MaxRetries = 0,
                GrpcOptions = new GrpcChannelOptions { HttpClient = _mock.HttpClient },
            }
        );
    }

    [OneTimeTearDown]
    public async Task GlobalTeardown()
    {
        await _mock.DisposeAsync();
    }

    protected static T ParseProtoJson<T>(string json) where T : IMessage<T>, new()
    {
        var descriptor = new T().Descriptor;
        if (descriptor.Oneofs.Count == 0)
        {
            return JsonParser.Default.Parse<T>(json);
        }
        var node = JsonNode.Parse(json);
        if (node is JsonObject obj)
        {
            foreach (var oneof in descriptor.Oneofs)
            {
                var seen = false;
                foreach (var field in oneof.Fields)
                {
                    var key = obj.ContainsKey(field.JsonName) ? field.JsonName : field.Name;
                    if (!obj.ContainsKey(key)) continue;
                    if (!seen) { seen = true; continue; }
                    obj.Remove(key);
                }
            }
        }
        return JsonParser.Default.Parse<T>(node!.ToJsonString());
    }
}
