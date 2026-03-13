using NUnit.Framework;
using SeedNullable;
using SeedNullable.Test.Unit.MockServer;
using SeedNullable.Test.Utils;

namespace SeedNullable.Test.Unit.MockServer.Nullable;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DeleteUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "username": "xy"
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .UsingDelete()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullable.DeleteUserAsync(
            new DeleteUserRequest { Username = "xy" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
