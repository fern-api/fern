using Grpc.Net.Client;
using NUnit.Framework;
using SeedApi.Core;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "results": [
                {
                  "matches": [
                    {
                      "id": "id"
                    }
                  ],
                  "namespace": "namespace"
                }
              ],
              "matches": [
                {
                  "id": "id",
                  "score": 1.1,
                  "values": [
                    1.1
                  ],
                  "metadata": {
                    "key": 1.1
                  },
                  "indexed_data": {
                    "indices": [
                      1
                    ],
                    "values": [
                      1.1
                    ]
                  }
                }
              ],
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        var stub = new DataServiceStub().OnQuery(
            (request) =>
            {
                var mockObject = JsonUtils.Deserialize<QueryResponse>(mockResponse);
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

        var response = await client.DataService.QueryAsync(new SeedApi.QueryRequest { TopK = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
