using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Imdb;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateMovieTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new CreateMovieRequest { Title = "title", Rating = 1.1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
