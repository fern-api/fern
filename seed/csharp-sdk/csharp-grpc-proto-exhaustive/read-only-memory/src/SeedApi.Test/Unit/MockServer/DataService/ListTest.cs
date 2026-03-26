using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using Google.Protobuf;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "columns": [
                {
                  "id": "id"
                },
                {
                  "id": "id"
                }
              ],
              "pagination": {
                "next": "next"
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        DataServiceStub.OnList(_ =>
            JsonParser.Default.Parse<Data.V1.Grpc.ListResponse>(mockResponse));

        var response = await Client.DataService.ListAsync(
            new SeedApi.ListRequest
            {
                Prefix = "prefix",
                Limit = 1,
                PaginationToken = "pagination_token",
                Namespace = "namespace",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "columns": [
                {
                  "id": "id"
                }
              ],
              "pagination": {
                "next": "next"
              },
              "namespace": "namespace",
              "usage": {
                "units": 1
              }
            }
            """;

        DataServiceStub.OnList(_ =>
            JsonParser.Default.Parse<Data.V1.Grpc.ListResponse>(mockResponse));

        var response = await Client.DataService.ListAsync(new SeedApi.ListRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
