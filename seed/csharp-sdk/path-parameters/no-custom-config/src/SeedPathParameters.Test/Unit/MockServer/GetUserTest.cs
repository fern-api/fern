using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace SeedPathParameters.Test.Unit.MockServer;

[TestFixture]
public class GetUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
                    .WithPath("/tenant_id/user/user_id")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserAsync(
            "tenant_id",
            "user_id",
            new GetUsersRequest(),
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
