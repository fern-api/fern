using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples.Commons;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class MetadataTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": ""metadata-js8dg24b"",
  ""data"": {
    ""foo"": ""bar"",
    ""baz"": ""qux""
  },
  ""jsonString"": ""{\""foo\"": \""bar\"", \""baz\"": \""qux\""}""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Metadata>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
