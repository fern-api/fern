using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using SeedApi.Core;

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

        DataServiceStub.OnQuery(_ =>
        {
            var mockObject = JsonUtils.Deserialize<QueryResponse>(mockResponse);
            return mockObject.ToProto();
        });

        var response = await Client.DataService.QueryAsync(new SeedApi.QueryRequest { TopK = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
