using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase;

#nullable enable

namespace SeedMixedCase.Test;

[TestFixture]
public class NestedUserSerializationTests
{
    [Test]
    public void NestedUserSerializationTest()
    {
        var inputJson =
            @"
        {
  ""Name"": ""username"",
  ""NestedUser"": {
    ""userName"": ""nestedUsername"",
    ""metadata_tags"": [
      ""tag1"",
      ""tag2""
    ],
    ""EXTRA_PROPERTIES"": {
      ""foo"": ""bar"",
      ""baz"": ""qux""
    }
  }
}
";

        var expectedObject = new NestedUser
        {
            Name = "username",
            NestedUser_ = new User
            {
                UserName = "nestedUsername",
                MetadataTags = new List<string>() { "tag1", "tag2" },
                ExtraProperties = new Dictionary<string, string>()
                {
                    { "foo", "bar" },
                    { "baz", "qux" },
                }
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<NestedUser>(
            inputJson,
            serializerOptions
        );
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
