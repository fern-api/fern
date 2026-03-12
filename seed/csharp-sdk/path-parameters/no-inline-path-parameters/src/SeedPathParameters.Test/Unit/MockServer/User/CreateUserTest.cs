using NUnit.Framework;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.User;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenant_id/user/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.CreateUserAsync(
            "tenant_id",
            new SeedPathParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
