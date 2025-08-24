using NUnit.Framework;
using SeedRequestParameters;

namespace SeedRequestParameters.Test.Unit.MockServer;

[TestFixture]
public class CreateUsernameWithReferencedTypeTest : BaseMockServerTest
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
                    .WithPath("/user/username-referenced")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateUsernameWithReferencedTypeAsync(
                new CreateUsernameReferencedRequest
                {
                    Tags = new List<string>() { "tags", "tags" },
                    Body = new CreateUsernameBody
                    {
                        Username = "username",
                        Password = "password",
                        Name = "test",
                    },
                }
            )
        );
    }
}
