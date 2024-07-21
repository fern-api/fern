using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class MomentTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": ""656f12d6-f592-444c-a1d3-a3cfd46d5b39"",
  ""date"": ""1994-01-01"",
  ""datetime"": ""1994-01-01T01:01:01Z""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Moment>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
