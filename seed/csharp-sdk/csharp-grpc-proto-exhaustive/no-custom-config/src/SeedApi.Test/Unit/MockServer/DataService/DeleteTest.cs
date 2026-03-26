using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DeleteTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {}
            """;

        DataServiceStub.OnDelete(_ =>
        {
            var mockObject = JsonUtils.Deserialize<DeleteResponse>(mockResponse);
            return mockObject.ToProto();
        });

        var response = await Client.DataService.DeleteAsync(new SeedApi.DeleteRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
