using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedCsharpAccess;
using SeedCsharpAccess.Core;

namespace SeedCsharpAccess.Test.Unit.MockServer;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CreateUserAsync(
            new User
            {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password",
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
