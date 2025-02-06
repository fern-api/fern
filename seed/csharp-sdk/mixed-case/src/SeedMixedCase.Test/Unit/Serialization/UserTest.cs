using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedMixedCase;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedMixedCase.Test;

[TestFixture]
public class UserTest
{
    [Test]
    public void TestSerialization() {
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

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<User>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
