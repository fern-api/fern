using NUnit.Framework;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Test.Unit.MockServer;
using SeedMultiLineDocs.Test.Utils;

namespace SeedMultiLineDocs.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "age": 1
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "age": 1
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

        var response = await Client.User.CreateUserAsync(
            new CreateUserRequest { Name = "name", Age = 1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
