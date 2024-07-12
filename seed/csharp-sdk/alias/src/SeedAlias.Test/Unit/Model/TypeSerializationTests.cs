using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAlias;

#nullable enable

namespace SeedAlias.Test;

[TestFixture]
public class TypeSerializationTests
{
    [Test]
    public void TypeSerializationTest()
    {
        var inputJson =
            @"
        {
  ""id"": ""type-df89sdg1"",
  ""name"": ""foo""
}
";

        var expectedObject = new Type { Id = "type-df89sdg1", Name = "foo" };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
