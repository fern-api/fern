using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs.Test.Unit.MockServer;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "age": 1
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "age": 1
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

        var response = await Client.User.CreateUserAsync(
            new CreateUserRequest { Name = "name", Age = 1 },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
