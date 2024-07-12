using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class ExtendedMovieTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": ""movie-sda231x"",
  ""title"": ""Pulp Fiction"",
  ""from"": ""Quentin Tarantino"",
  ""rating"": 8.5,
  ""type"": ""movie"",
  ""tag"": ""tag-12efs9dv"",
  ""cast"": [
    ""John Travolta"",
    ""Samuel L. Jackson"",
    ""Uma Thurman"",
    ""Bruce Willis""
  ],
  ""metadata"": {
    ""academyAward"": true,
    ""releaseDate"": ""2023-12-08"",
    ""ratings"": {
      ""rottenTomatoes"": 97,
      ""imdb"": 7.6
    }
  }
}
";

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
                "Bruce Willis"
            },
            Metadata = new Dictionary<string, object>()
            {
                { "academyAward", "--unknown--" },
                { "releaseDate", "--unknown--" },
                { "ratings", "--unknown--" },
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<ExtendedMovie>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
