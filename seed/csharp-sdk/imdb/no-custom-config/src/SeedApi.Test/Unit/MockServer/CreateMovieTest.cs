using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class CreateMovieTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "title": "title",
              "rating": 1.1
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/movies/create-movie")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Imdb.CreateMovieAsync(
            new CreateMovieRequest { Title = "title", Rating = 1.1 },
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
