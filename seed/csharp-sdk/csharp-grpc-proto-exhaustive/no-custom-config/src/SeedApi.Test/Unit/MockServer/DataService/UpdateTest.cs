using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateTest : BaseGrpcMockServerTest
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

        DataServiceStub.OnUpdate(_ => ParseProtoJson<Data.V1.Grpc.UpdateResponse>(mockResponse));

        var response = await Client.DataService.UpdateAsync(
            new SeedApi.UpdateRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
