using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

#nullable enable

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class GetUserTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "string",
              "username": "string",
              "email": "string",
              "age": 1,
              "weight": 1.1,
              "metadata": {}
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithParam("username", "string")
                    .WithParam("age", "1")
                    .WithParam("weight", "1.1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserAsync(
            new GetUserRequest
            {
                Username = "string",
                Age = 1,
                Weight = 1.1f,
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
