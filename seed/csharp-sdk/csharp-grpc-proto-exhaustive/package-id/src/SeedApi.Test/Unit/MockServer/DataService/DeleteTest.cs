using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DeleteTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {}
            """;

        var stub = new DataServiceStub().OnDelete(
            (request) =>
            {
                var mockObject = JsonUtils.Deserialize<DeleteResponse>(mockResponse);
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
                GrpcOptions = new GrpcChannelOptions { HttpClient = mock.HttpClient },
            }
        );

        var response = await client.DataService.DeleteAsync(new SeedApi.DeleteRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
