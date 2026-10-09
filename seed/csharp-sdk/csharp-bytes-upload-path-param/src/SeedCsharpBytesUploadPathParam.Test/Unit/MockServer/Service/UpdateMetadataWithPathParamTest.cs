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
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/upload-content/tenantId/objectPath/metadata")
                    .WithParam("label", "label")
                    .UsingPost()
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
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/upload-content/acme/path/to/object.txt/metadata")
                    .WithParam("label", "primary")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.UpdateMetadataWithPathParamAsync(
                new UpdateMetadataRequest
                {
                    TenantId = "acme",
                    ObjectPath = "path/to/object.txt",
                    Label = "primary",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_3()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/upload-content/acme/objectPath/metadata")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.UpdateMetadataWithPathParamAsync(
                new UpdateMetadataRequest { ObjectPath = "objectPath" }
            )
        );
    }
}
