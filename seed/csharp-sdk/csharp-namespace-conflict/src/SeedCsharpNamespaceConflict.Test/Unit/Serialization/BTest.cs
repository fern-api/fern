using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCsharpNamespaceConflict.A;

#nullable enable

namespace SeedCsharpNamespaceConflict.Test;

[TestFixture]
public class BTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": {
    ""name"": ""foo""
  }
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<B>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
