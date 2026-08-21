using NUnit.Framework;
using SeedCsharpBytesUploadPathParam;
using SeedCsharpBytesUploadPathParam.Test.Unit.MockServer;

namespace SeedCsharpBytesUploadPathParam.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateMetadataWithPathParamTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        const string requestJson = """
            {
              "label": "label"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/upload-content/tenantId/objectPath/metadata")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.UpdateMetadataWithPathParamAsync(
                new UpdateMetadataRequest
                {
                    TenantId = "tenantId",
                    ObjectPath = "objectPath",
                    Label = "label",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {
              "label": "primary"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/upload-content/acme/objectPath/metadata")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.UpdateMetadataWithPathParamAsync(
                new UpdateMetadataRequest { ObjectPath = "objectPath", Label = "primary" }
            )
        );
    }
}
