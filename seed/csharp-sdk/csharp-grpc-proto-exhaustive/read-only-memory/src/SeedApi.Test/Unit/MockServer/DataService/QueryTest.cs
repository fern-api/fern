using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryTest : BaseGrpcMockServerTest
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

        DataServiceStub.OnQuery(_ => ParseProtoJson<Data.V1.Grpc.QueryResponse>(mockResponse));

        var response = await Client.DataService.QueryAsync(new SeedApi.QueryRequest { TopK = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
