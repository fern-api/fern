using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase;

namespace SeedMixedCase.Test;

[TestFixture]
public class UserTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""userName"": ""username"",
          ""metadata_tags"": [
            ""tag1"",
            ""tag2""
          ],
          ""EXTRA_PROPERTIES"": {
            ""foo"": ""bar"",
            ""baz"": ""qux""
          }
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<User>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
