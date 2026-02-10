using NUnit.Framework;
using SeedRequestParameters;

namespace SeedRequestParameters.Test.Unit.MockServer;

[TestFixture]
public class CreateUsernameOptionalTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
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
                    .WithPath("/user/username-optional")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateUsernameOptionalAsync(
                new CreateUsernameBodyOptionalProperties
                {
                    Username = "username",
                    Password = "password",
                    Name = "test",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user/username-optional")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateUsernameOptionalAsync(
                new CreateUsernameBodyOptionalProperties()
            )
        );
    }
}
