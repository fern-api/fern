using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedValidation;

#nullable enable

namespace SeedValidation.Test;

[TestFixture]
public class TypeSerializationTests
{
    [Test]
    public void TypeSerializationTest()
    {
        var inputJson =
            @"
        {
  ""decimal"": 1.1,
  ""even"": 2,
  ""name"": ""rules""
}
";

        var expectedObject = new Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules"
        };

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
