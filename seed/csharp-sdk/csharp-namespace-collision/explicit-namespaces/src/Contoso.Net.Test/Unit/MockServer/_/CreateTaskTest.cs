using global::Contoso.Net.Test.Unit.MockServer;
using global::Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTaskTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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
            new global::Contoso.Net.Task
            {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
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
            new global::Contoso.Net.Task
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
