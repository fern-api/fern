using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Core;

namespace SeedExtraProperties.Test.Unit.MockServer;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "_type": "CreateUserRequest",
              "_version": "v1",
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
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
            new CreateUserRequest
            {
                Type = "CreateUserRequest",
                Version = "v1",
                Name = "name",
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
