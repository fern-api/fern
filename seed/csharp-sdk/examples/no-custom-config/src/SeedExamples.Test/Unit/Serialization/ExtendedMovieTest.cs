using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
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
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
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
        var obj = new ExtendedMovie
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
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
