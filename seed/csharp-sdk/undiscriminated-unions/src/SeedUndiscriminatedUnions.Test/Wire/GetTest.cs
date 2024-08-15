using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUndiscriminatedUnions.Core;
using SeedUndiscriminatedUnions.Test.Wire;

#nullable enable

namespace SeedUndiscriminatedUnions.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
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
