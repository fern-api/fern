using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedApi.Core;
using SeedApi.Test.Wire;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class GetMovieTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "id": "string",
              "title": "string",
              "rating": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/movies/string").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Imdb.GetMovieAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
