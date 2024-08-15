using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUnions.Core;
using SeedUnions.Test.Wire;

#nullable enable

namespace SeedUnions.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "type": "circle",
              "id": "string",
              "radius": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
