using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using Google.Protobuf;

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
            JsonParser.Default.Parse<Data.V1.Grpc.DeleteResponse>(mockResponse));

        var response = await Client.DataService.DeleteAsync(new SeedApi.DeleteRequest());
        JsonAssert.AreEqual(response, mockResponse);
    }
}
