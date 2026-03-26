using Google.Protobuf;
using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;

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

    protected static T ParseProtoJson<T>(string json)
        where T : IMessage<T>, new()
    {
        var settings = JsonParser.Settings.Default.WithIgnoreUnknownFields(true);
        return new JsonParser(settings).Parse<T>(json);
    }
}
