using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "resource": {
                "id": "id",
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
              },
              "success": true,
              "error_message": "error_message"
            }
            """;

        DataServiceStub.OnCreate(_ => ParseProtoJson<Data.V1.Grpc.CreateResponse>(mockResponse));

        var response = await Client.DataService.CreateAsync(
            new SeedApi.CreateRequest { Name = "name" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
