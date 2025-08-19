using NUnit.Framework;
using SeedSystem.Core;

namespace SeedSystem.Test.Unit.MockServer.System;

[TestFixture]
public class CreateTaskTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        const string mockResponse = """
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

        var response = await Client.System.CreateTaskAsync(
            new SeedSystem.System.Task
            {
                Name = "name",
                User = new SeedSystem.System.User
                {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = "USA",
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SeedSystem.System.Task>(mockResponse)).UsingDefaults()
        );
    }
}
