using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CheckTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "created_at": "2024-01-15T09:30:00Z",
              "updated_at": "2024-01-15T09:30:00Z"
            }
            """;

        var stub = new DataServiceStub().OnCheck(
            (request) =>
            {
                var mockObject = CheckResponse.FromJson(mockResponse);
                return mockObject.ToProto();
            }
        );

        await using var mock = await GrpcMockServerBuilder
            .Configure()
            .WithService<Data.V1.Grpc.DataService.DataServiceBase>(stub)
            .BuildAsync();

        var client = new SeedApiClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "http://localhost",
                MaxRetries = 0,
                GrpcOptions = new GrpcChannelOptions
                {
                    HttpClient = mock.Channel.CreateHttpClient(),
                },
            }
        );

        var response = await await client.DataService.CheckAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "created_at": "2024-01-15T09:30:00Z",
              "updated_at": "2024-01-15T09:30:00Z"
            }
            """;

        var stub = new DataServiceStub().OnCheck(
            (request) =>
            {
                var mockObject = CheckResponse.FromJson(mockResponse);
                return mockObject.ToProto();
            }
        );

        await using var mock = await GrpcMockServerBuilder
            .Configure()
            .WithService<Data.V1.Grpc.DataService.DataServiceBase>(stub)
            .BuildAsync();

        var client = new SeedApiClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "http://localhost",
                MaxRetries = 0,
                GrpcOptions = new GrpcChannelOptions
                {
                    HttpClient = mock.Channel.CreateHttpClient(),
                },
            }
        );

        var response = await await client.DataService.CheckAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
