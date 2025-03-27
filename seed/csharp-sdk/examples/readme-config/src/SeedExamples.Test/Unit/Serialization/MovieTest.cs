using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class MovieTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
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
              },
              "revenue": 1000000
            }
            """;
        var expectedObject = new Movie
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
                    new Dictionary<object, object?>() { { "imdb", 7.6 }, { "rottenTomatoes", 97 } }
                },
            },
            Revenue = 1000000,
        };
        var deserializedObject = JsonUtils.Deserialize<Movie>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
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
              },
              "revenue": 1000000
            }
            """;
        var actualObj = new Movie
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
