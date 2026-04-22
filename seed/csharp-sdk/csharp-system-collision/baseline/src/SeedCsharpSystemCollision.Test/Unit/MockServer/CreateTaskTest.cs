using NUnit.Framework;
using SeedCsharpSystemCollision;
using SeedCsharpSystemCollision.Test.Utils;

namespace SeedCsharpSystemCollision.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTaskTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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

        var response = await Client.CreateTaskAsync(
            new SeedCsharpSystemCollision.Task
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
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
