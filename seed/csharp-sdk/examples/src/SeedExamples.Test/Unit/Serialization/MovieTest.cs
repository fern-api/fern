using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class MovieTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": ""movie-c06a4ad7"",
  ""prequel"": ""movie-cv9b914f"",
  ""title"": ""The Boy and the Heron"",
  ""from"": ""Hayao Miyazaki"",
  ""rating"": 8,
  ""type"": ""movie"",
  ""tag"": ""tag-wf9as23d"",
  ""metadata"": {
    ""actors"": [
      ""Christian Bale"",
      ""Florence Pugh"",
      ""Willem Dafoe""
    ],
    ""releaseDate"": ""2023-12-08"",
    ""ratings"": {
      ""rottenTomatoes"": 97,
      ""imdb"": 7.6
    }
  }
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Movie>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
