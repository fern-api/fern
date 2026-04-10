using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Imdb;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetmovieTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "id": "id",
              "title": "title",
              "rating": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/movies/movieId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Imdb.GetmovieAsync(
            new ImdbGetMovieRequest { MovieId = "movieId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "id": "id",
              "title": "title",
              "rating": 1.1
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/movies/movieId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Imdb.GetmovieAsync(
            new ImdbGetMovieRequest { MovieId = "movieId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
