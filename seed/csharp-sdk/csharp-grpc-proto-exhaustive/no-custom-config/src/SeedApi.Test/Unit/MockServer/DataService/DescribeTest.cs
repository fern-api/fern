using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using Google.Protobuf;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DescribeTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "namespaces": {
                "key": {
                  "count": 1
                }
              },
              "dimension": 1,
              "fullness": 1.1,
              "total_count": 1
            }
            """;

        DataServiceStub.OnDescribe(_ =>
            JsonParser.Default.Parse<Data.V1.Grpc.DescribeResponse>(mockResponse));

        var response = await Client.DataService.DescribeAsync(new SeedApi.DescribeRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
