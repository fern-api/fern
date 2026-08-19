using NUnit.Framework;
using SeedCsharpNamespaceCollision.Test.Utils;

namespace SeedCsharpNamespaceCollision.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "email": "email"
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
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
