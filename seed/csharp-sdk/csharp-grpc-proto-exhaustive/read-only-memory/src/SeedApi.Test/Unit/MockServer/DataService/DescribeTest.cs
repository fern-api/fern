using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DescribeTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
        {
            var mockObject = JsonUtils.Deserialize<DescribeResponse>(mockResponse);
            return mockObject.ToProto();
        });

        var response = await Client.DataService.DescribeAsync(new SeedApi.DescribeRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
