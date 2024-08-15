using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedResponseProperty.Core;
using SeedResponseProperty.Test.Wire;

#nullable enable

namespace SeedResponseProperty.Test;

[TestFixture]
public class GetMovieNameTest : BaseWireTest
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
                    .WithPath("/movie")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetMovieNameAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
