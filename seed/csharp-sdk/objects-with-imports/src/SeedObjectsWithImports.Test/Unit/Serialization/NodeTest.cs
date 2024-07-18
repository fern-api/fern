using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObjectsWithImports;

#nullable enable

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class NodeTest
{
    [Test]
    public void TestSerialization_1()
    {
        var inputJson =
            @"
        {
  ""id"": ""node-8dvgfja2"",
  ""label"": ""left"",
  ""metadata"": {
    ""id"": ""metadata-kjasf923"",
    ""data"": {
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

        var deserializedObject = JsonSerializer.Deserialize<Node>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }

    [Test]
    public void TestSerialization_2()
    {
        var inputJson =
            @"
        {
  ""id"": ""node-cwda9fi2x"",
  ""label"": ""right"",
  ""metadata"": {
    ""id"": ""metadata-lkasdfv9j"",
    ""data"": {
      ""one"": ""two"",
      ""three"": ""four""
    }
  }
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Node>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
