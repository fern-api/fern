using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UploadTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "count": 1
            }
            """;

        DataServiceStub.OnUpload(_ =>
            ParseProtoJson<Data.V1.Grpc.UploadResponse>(mockResponse));

        var response = await Client.DataService.UploadAsync(
            new SeedApi.UploadRequest
            {
                Columns = new List<SeedApi.Column>()
                {
                    new SeedApi.Column
                    {
                        Id = "id",
                        Values = new List<float>() { 1.1f },
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
