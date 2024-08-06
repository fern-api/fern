using NUnit.Framework;
using SeedFileDownload.Core;
using SeedFileDownload.Test.Utils;
using SeedFileDownload.Test.Wire;

#nullable enable

namespace SeedFileDownload.Test;

[TestFixture]
public class DownloadFileTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string mockResponse = """
            "SGVsbG8gd29ybGQh"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Service.DownloadFileAsync().GetAwaiter().GetResult();
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
