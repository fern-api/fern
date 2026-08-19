using NUnit.Framework;
using SeedCsharpNamespaceCollision.ScimConfiguration;
using SeedCsharpNamespaceCollision.Test.Utils;

namespace SeedCsharpNamespaceCollision.Test.Unit.MockServer.ScimConfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTokenTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "tokenId": "tokenId",
              "token": "token",
              "scopes": [
                "scopes",
                "scopes"
              ],
              "createdAt": "createdAt"
            }
            """;

        const string mockResponse = """
            {
              "tokenId": "tokenId",
              "token": "token",
              "scopes": [
                "scopes",
                "scopes"
              ],
              "createdAt": "createdAt"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/scim-configuration/tokens")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.ScimConfiguration.CreateTokenAsync(
            new ScimToken
            {
                TokenId = "tokenId",
                Token = "token",
                Scopes = new List<string>() { "scopes", "scopes" },
                CreatedAt = "createdAt",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
