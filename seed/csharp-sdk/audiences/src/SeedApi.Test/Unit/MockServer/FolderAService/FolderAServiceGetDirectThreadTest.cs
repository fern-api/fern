using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.FolderAService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FolderAServiceGetDirectThreadTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": {
                "foo": {
                  "bar_property": "bar_property"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("ids", "ids")
                    .WithParam("tags", "tags")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderAService.FolderAServiceGetDirectThreadAsync(
            new FolderAServiceGetDirectThreadRequest { Ids = ["ids"], Tags = ["tags"] }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
