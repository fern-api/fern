using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CheckTest : BaseGrpcMockServerTest
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

        DataServiceStub.OnCheck(_ => ParseProtoJson<Data.V1.Grpc.CheckResponse>(mockResponse));

        var response = await Client.DataService.CheckAsync();
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

        DataServiceStub.OnCheck(_ => ParseProtoJson<Data.V1.Grpc.CheckResponse>(mockResponse));

        var response = await Client.DataService.CheckAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
