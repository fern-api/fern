using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedNullable;
using SeedNullable.Core;

namespace SeedNullable.Test.Unit.MockServer;

[TestFixture]
public class DeleteUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "username": "xy"
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .UsingDelete()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullable.DeleteUserAsync(
            new DeleteUserRequest { Username = "xy" },
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
