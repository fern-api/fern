using Contoso.Net;
using Contoso.Net.Test.Unit.MockServer;
using Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.Scimconfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreatetokenTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.CreatetokenAsync(
            new ScimConfigurationScimToken
            {
                TokenId = "tokenId",
                Token = "token",
                Scopes = new List<string>() { "scopes", "scopes" },
                CreatedAt = "createdAt",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "tokenId": "tokenId",
              "createdAt": "createdAt"
            }
            """;

        const string mockResponse = """
            {
              "tokenId": "tokenId",
              "token": "token",
              "scopes": [
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.CreatetokenAsync(
            new ScimConfigurationScimToken { TokenId = "tokenId", CreatedAt = "createdAt" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
