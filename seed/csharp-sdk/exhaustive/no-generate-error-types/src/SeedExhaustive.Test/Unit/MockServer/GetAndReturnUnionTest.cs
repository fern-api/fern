using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetAndReturnUnionTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "animal": "dog",
              "name": "string",
              "likesToWoof": true
            }
            """;

        const string mockResponse = """
            {
              "animal": "dog",
              "name": "string",
              "likesToWoof": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/union")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Union.GetAndReturnUnionAsync(
            new Dog { Name = "string", LikesToWoof = true },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
