using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;
using SeedApi.Test.Wire;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class CreateTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "user": {
                "username": "username",
                "email": "email",
                "age": 1,
                "weight": 1.1,
                "metadata": {
                  "key": "value"
                }
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

        var response = await Client.User.CreateAsync(new CreateRequest(), RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "user": {
                "username": "username",
                "email": "email",
                "age": 1,
                "weight": 1.1,
                "metadata": {
                  "key": "value"
                }
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

        var response = await Client.User.CreateAsync(new CreateRequest(), RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
