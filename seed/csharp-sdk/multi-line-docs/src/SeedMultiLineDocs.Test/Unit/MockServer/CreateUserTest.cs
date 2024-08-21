using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;
using SeedMultiLineDocs.Test.Unit.MockServer;

#nullable enable

namespace SeedMultiLineDocs.Test;

[TestFixture]
public class CreateUserTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "string",
              "age": 1
            }
            """;

        const string mockResponse = """
            {
              "id": "string",
              "name": "string",
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
            new CreateUserRequest { Name = "string", Age = 1 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
