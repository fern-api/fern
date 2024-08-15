using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Wire;

#nullable enable

namespace SeedUnions.Test;

[TestFixture]
public class UpdateTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            {
              "type": "circle",
              "id": "string",
              "radius": 1.1
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.UpdateAsync(
            new Circle { Id = "string", Radius = 1.1 },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
