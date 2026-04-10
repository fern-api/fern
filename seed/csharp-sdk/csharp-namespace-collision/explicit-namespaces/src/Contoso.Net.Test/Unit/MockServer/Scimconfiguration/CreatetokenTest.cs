using global::Contoso.Net.ScimConfiguration;
using global::Contoso.Net.Test.Unit.MockServer;
using global::Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.ScimConfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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
