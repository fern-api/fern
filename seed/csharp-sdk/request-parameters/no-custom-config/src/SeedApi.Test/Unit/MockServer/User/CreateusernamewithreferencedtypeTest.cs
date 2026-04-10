using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateusernamewithreferencedtypeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "username": "username",
              "password": "password",
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user/username-referenced")
                    .WithParam("tags", "tags")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.User.CreateusernamewithreferencedtypeAsync(
                new CreateUsernameBody
                {
                    Tags = ["tags"],
                    Username = "username",
                    Password = "password",
                    Name = "name",
                }
            )
        );
    }
}
