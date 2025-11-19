using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace SeedPathParameters.Test.Unit.MockServer;

[TestFixture]
public class GetUserMetadataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
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
                    .WithPath("/tenant_id/user/user_id/metadata/v1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserMetadataAsync(
            new GetUserMetadataRequest
            {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1,
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingDefaults()
        );
    }
}
