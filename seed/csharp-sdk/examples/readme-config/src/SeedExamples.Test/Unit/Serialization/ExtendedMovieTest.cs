using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

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
          },
          ""revenue"": 1000000
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<ExtendedMovie>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
