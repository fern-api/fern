using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObjectsWithImports.Commons;

#nullable enable

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class MetadataSerializationTests
{
    [Test]
    public void MetadataSerializationTest()
    {
        var inputJson =
            @"
        {
  ""id"": ""metadata-js8dg24b"",
  ""data"": {
    ""foo"": ""bar"",
    ""baz"": ""qux""
  }
}
";

        var expectedObject = new Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" }, }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Metadata>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
