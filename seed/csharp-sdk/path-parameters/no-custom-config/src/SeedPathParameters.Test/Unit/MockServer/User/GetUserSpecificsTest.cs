using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.User;

[TestFixture]
public class GetUserSpecificsTest : BaseMockServerTest
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
                    .WithPath("/tenant_id/user/user_id/specifics/1/thought")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserSpecificsAsync(
            new GetUserSpecificsRequest
            {
                TenantId = "tenant_id",
                UserId = "user_id",
                Version = 1,
                Thought = "thought",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
