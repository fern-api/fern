using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Core;
using SeedExtraProperties.Test.Wire;

#nullable enable

namespace SeedExtraProperties.Test;

[TestFixture]
public class CreateUserTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            {
              "_type": "CreateUserRequest",
              "_version": "v1",
              "name": "string"
            }
            """;

        const string mockResponse = """
            {
              "name": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/user")
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
            new CreateUserRequest
            {
                Type = "CreateUserRequest",
                Version = "v1",
                Name = "string"
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
