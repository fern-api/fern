using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test.Unit.MockServer;

[TestFixture]
public class SendOptionalNullableWithAllOptionalPropertiesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "updateDraft": true
            }
            """;

        const string mockResponse = """
            {
              "success": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/deploy/actionId/versions/id")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Optional.SendOptionalNullableWithAllOptionalPropertiesAsync(
            "actionId",
            "id",
            new DeployParams { UpdateDraft = true }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<DeployResponse>(mockResponse)).UsingDefaults()
        );
    }
}
