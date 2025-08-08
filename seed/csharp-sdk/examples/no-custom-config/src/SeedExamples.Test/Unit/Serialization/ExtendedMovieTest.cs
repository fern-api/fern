using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class ExtendedMovieTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "movie-sda231x",
              "title": "Pulp Fiction",
              "from": "Quentin Tarantino",
              "rating": 8.5,
              "type": "movie",
              "tag": "tag-12efs9dv",
              "cast": [
                "John Travolta",
                "Samuel L. Jackson",
                "Uma Thurman",
                "Bruce Willis"
              ],
              "metadata": {
                "academyAward": true,
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              },
              "revenue": 1000000
            }
            """;
        var expectedObject = new ExtendedMovie
        {
            Id = "movie-sda231x",
            Title = "Pulp Fiction",
            From = "Quentin Tarantino",
            Rating = 8.5,
            Type = "movie",
            Tag = "tag-12efs9dv",
            Cast = new List<string>()
            {
                "John Travolta",
                "Samuel L. Jackson",
                "Uma Thurman",
                "Bruce Willis",
            },
            Metadata = new Dictionary<string, object>()
            {
                { "academyAward", true },
                { "releaseDate", "2023-12-08" },
                {
                    "ratings",
                    new Dictionary<object, object?>() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
                },
            },
            Revenue = 1000000,
        };
        var deserializedObject = JsonUtils.Deserialize<ExtendedMovie>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "id": "movie-sda231x",
              "title": "Pulp Fiction",
              "from": "Quentin Tarantino",
              "rating": 8.5,
              "type": "movie",
              "tag": "tag-12efs9dv",
              "cast": [
                "John Travolta",
                "Samuel L. Jackson",
                "Uma Thurman",
                "Bruce Willis"
              ],
              "metadata": {
                "academyAward": true,
                "releaseDate": "2023-12-08",
                "ratings": {
                  "rottenTomatoes": 97,
                  "imdb": 7.6
                }
              },
              "revenue": 1000000
            }
            """;
        var actualObj = new ExtendedMovie
        {
            Id = "movie-sda231x",
            Title = "Pulp Fiction",
            From = "Quentin Tarantino",
            Rating = 8.5,
            Type = "movie",
            Tag = "tag-12efs9dv",
            Cast = new List<string>()
            {
                "John Travolta",
                "Samuel L. Jackson",
                "Uma Thurman",
                "Bruce Willis",
            },
            Metadata = new Dictionary<string, object>()
            {
                { "academyAward", true },
                { "releaseDate", "2023-12-08" },
                {
                    "ratings",
                    new Dictionary<object, object?>() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
                },
            },
            Revenue = 1000000,
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
