using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Imdb;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetMovieTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.Imdb.GetMovieAsync(
            new GetMovieImdbRequest { MovieId = "movieId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsNotFoundError()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/movies/movieId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<NotFoundError>(async () =>
            await Client.Imdb.GetMovieAsync(new GetMovieImdbRequest { MovieId = "movieId" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
