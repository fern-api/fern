using NUnit.Framework;

namespace SeedRequestParameters.Test.Unit.MockServer;

[TestFixture]
public class CreateUsernameTest : BaseMockServerTest
{
    [Test]
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
                    Username = "username",
                    Password = "password",
                    Name = "test",
                }
            )
        );
    }
}
