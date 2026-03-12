using NUnit.Framework;
using SeedRequestParameters;
using SeedRequestParameters.Test.Unit.MockServer;

namespace SeedRequestParameters.Test.Unit.MockServer.User;

[TestFixture]
public class CreateUsernameTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "username": "username",
              "password": "password",
              "name": "test"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user/username")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateUsernameAsync(
                new CreateUsernameRequest
                {
                    Tags = new List<string>() { "tags", "tags" },
                    Username = "username",
                    Password = "password",
                    Name = "test",
                }
            )
        );
    }
}
