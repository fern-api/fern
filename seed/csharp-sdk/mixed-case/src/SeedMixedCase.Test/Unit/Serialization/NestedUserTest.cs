using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedMixedCase;

#nullable enable

namespace SeedMixedCase.Test;

[TestFixture]
public class NestedUserTest
{
    [Test]
    public void TestSerialization()
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

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<NestedUser>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
