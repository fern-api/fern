using FluentAssertions.Json;
using global::System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class ListTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.User.ListAsync(
            new ListUsersRequest { Limit = 1 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
