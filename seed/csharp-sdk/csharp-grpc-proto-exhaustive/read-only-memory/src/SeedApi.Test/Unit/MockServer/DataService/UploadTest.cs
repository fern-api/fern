using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;
using Google.Protobuf;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UploadTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "count": 1
            }
            """;

        DataServiceStub.OnUpload(_ =>
            JsonParser.Default.Parse<Data.V1.Grpc.UploadResponse>(mockResponse));

        var response = await Client.DataService.UploadAsync(
            new SeedApi.UploadRequest
            {
                Columns = new List<SeedApi.Column>()
                {
                    new SeedApi.Column { Id = "id", Values = new[] { 1.1f } },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
