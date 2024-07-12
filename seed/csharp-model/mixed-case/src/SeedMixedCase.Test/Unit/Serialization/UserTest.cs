using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase;

#nullable enable

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

        var expectedObject = new User
        {
            UserName = "username",
            MetadataTags = new List<string>() { "tag1", "tag2" },
            ExtraProperties = new Dictionary<string, string>()
            {
                { "foo", "bar" },
                { "baz", "qux" },
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<User>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
