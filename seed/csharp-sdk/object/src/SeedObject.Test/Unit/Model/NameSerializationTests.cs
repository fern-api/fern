using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObject;

#nullable enable

namespace SeedObject.Test;

[TestFixture]
public class NameSerializationTests
{
    [Test]
    public void NameSerializationTest()
    {
        var inputJson =
            @"
        {
  ""id"": ""name-sdfg8ajk"",
  ""value"": ""name""
}
";

        var expectedObject = new Name { Id = "name-sdfg8ajk", Value = "name" };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Name>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
