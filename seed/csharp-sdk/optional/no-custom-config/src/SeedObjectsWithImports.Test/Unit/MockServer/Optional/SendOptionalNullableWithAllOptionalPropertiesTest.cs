using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Test.Unit.MockServer;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test.Unit.MockServer.Optional;

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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
