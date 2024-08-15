using NUnit.Framework;
using SeedFileDownload.Test.Wire;

#nullable enable

namespace SeedFileDownload.Test;

[TestFixture]
public class DownloadFileTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.DownloadFileAsync(RequestOptions)
        );
    }
}
