using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

#nullable enable

namespace SeedCsharpNamespaceConflict.Test;

[TestFixture]
public class ATest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""name"": ""foo""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<SeedCsharpNamespaceConflict.A.A>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
