using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class CreateMovieTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string requestJson = """
            {
              "id": "movie-c06a4ad7",
              "prequel": "movie-cv9b914f",
              "title": "The Boy and the Heron",
              "from": "Hayao Miyazaki",
              "rating": 8,
              "type": "movie",
              "tag": "tag-wf9as23d",
              "metadata": {
                "actors": [
                  "Christian Bale",
                  "Florence Pugh",
                  "Willem Dafoe"
                ],
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              }
            }
            """;

        const string mockResponse = """
            "movie-c06a4ad7"
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

        var response = await Client.Service.CreateMovieAsync(
            new Movie
            {
                Id = "movie-c06a4ad7",
                Prequel = "movie-cv9b914f",
                Title = "The Boy and the Heron",
                From = "Hayao Miyazaki",
                Rating = 8,
                Type = "movie",
                Tag = "tag-wf9as23d",
                Metadata = new Dictionary<string, object>()
                {
                    {
                        "actors",
                        new List<object?>() { "Christian Bale", "Florence Pugh", "Willem Dafoe" }
                    },
                    { "releaseDate", "2023-12-08" },
                    {
                        "ratings",
                        new Dictionary<object, object?>()
                        {
                            { "imdb", 7.6 },
                            { "rottenTomatoes", 97 },
                        }
                    },
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string requestJson = """
            {
              "id": "movie-c06a4ad7",
              "prequel": "movie-cv9b914f",
              "title": "The Boy and the Heron",
              "from": "Hayao Miyazaki",
              "rating": 8,
              "type": "movie",
              "tag": "tag-wf9as23d",
              "metadata": {
                "actors": [
                  "Christian Bale",
                  "Florence Pugh",
                  "Willem Dafoe"
                ],
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              }
            }
            """;

        const string mockResponse = """
            "movie-c06a4ad7"
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

        var response = await Client.Service.CreateMovieAsync(
            new Movie
            {
                Id = "movie-c06a4ad7",
                Prequel = "movie-cv9b914f",
                Title = "The Boy and the Heron",
                From = "Hayao Miyazaki",
                Rating = 8,
                Type = "movie",
                Tag = "tag-wf9as23d",
                Metadata = new Dictionary<string, object>()
                {
                    {
                        "actors",
                        new List<object?>() { "Christian Bale", "Florence Pugh", "Willem Dafoe" }
                    },
                    { "releaseDate", "2023-12-08" },
                    {
                        "ratings",
                        new Dictionary<object, object?>()
                        {
                            { "imdb", 7.6 },
                            { "rottenTomatoes", 97 },
                        }
                    },
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
