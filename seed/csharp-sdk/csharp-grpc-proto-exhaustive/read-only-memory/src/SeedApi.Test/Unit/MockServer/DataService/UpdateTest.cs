using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "updated_at": "2024-01-15T09:30:00Z",
              "index_type": "INDEX_TYPE_INVALID",
              "details": {
                "@type": "@type"
              },
              "index_types": [
                "INDEX_TYPE_INVALID"
              ],
              "status": "STATUS_UNSPECIFIED"
            }
            """;

        var stub = new DataServiceStub().OnUpdate(
            (request) =>
            {
                var mockObject = JsonUtils.Deserialize<UpdateResponse>(mockResponse);
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

        var response = await client.DataService.UpdateAsync(
            new SeedApi.UpdateRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
