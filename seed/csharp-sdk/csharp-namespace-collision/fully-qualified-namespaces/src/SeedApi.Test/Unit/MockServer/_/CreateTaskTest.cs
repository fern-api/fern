using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTaskTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/root-users/tasks")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.CreateTaskAsync(
            new Task
            {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "email": "email",
              "password": "password"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/root-users/tasks")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client._.CreateTaskAsync(
            new Task
            {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
