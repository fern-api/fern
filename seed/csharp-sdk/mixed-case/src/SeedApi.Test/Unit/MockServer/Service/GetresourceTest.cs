using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetresourceTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "resource_type": "user",
              "userName": "userName",
              "metadata_tags": [
                "metadata_tags",
                "metadata_tags"
              ],
              "EXTRA_PROPERTIES": {
                "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/resource/ResourceID")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetresourceAsync(
            new ServiceGetResourceRequest { ResourceId = "ResourceID" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "userName": "userName",
              "metadata_tags": [
                "metadata_tags"
              ],
              "EXTRA_PROPERTIES": {
                "key": "value"
              },
              "resource_type": "user"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/resource/ResourceID")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetresourceAsync(
            new ServiceGetResourceRequest { ResourceId = "ResourceID" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
