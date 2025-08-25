using NUnit.Framework;
using SeedCsharpSystemCollision;

namespace SeedCsharpSystemCollision.Test.Unit.MockServer;

[TestFixture]
public class EmptyResponseTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "user": {
                "line1": "line1",
                "line2": "line2",
                "city": "city",
                "state": "state",
                "zip": "zip",
                "country": "USA"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/empty")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EmptyResponseAsync(
                new Task
                {
                    Name = "name",
                    User = new User
                    {
                        Line1 = "line1",
                        Line2 = "line2",
                        City = "city",
                        State = "state",
                        Zip = "zip",
                        Country = "USA",
                    },
                }
            )
        );
    }
}
