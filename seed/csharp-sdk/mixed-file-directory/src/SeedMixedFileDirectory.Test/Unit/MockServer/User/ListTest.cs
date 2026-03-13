using NUnit.Framework;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Test.Unit.MockServer;
using SeedMixedFileDirectory.Test.Utils;

namespace SeedMixedFileDirectory.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "age": 1
              },
              {
                "id": "id",
                "name": "name",
                "age": 1
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users/")
                    .WithParam("limit", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.ListAsync(new ListUsersRequest { Limit = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
