using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedValidation;

#nullable enable

namespace SeedValidation.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""decimal"": 1.1,
  ""even"": 2,
  ""name"": ""rules"",
  ""shape"": ""SQUARE""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
