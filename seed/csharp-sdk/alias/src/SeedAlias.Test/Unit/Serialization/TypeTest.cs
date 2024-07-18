using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAlias;

#nullable enable

namespace SeedAlias.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""id"": ""type-df89sdg1"",
  ""name"": ""foo"",
  ""unknownValue"": {
    ""id"": ""hello"",
    ""number"": ""hi"",
    ""listy"": [
      ""hello"",
      ""there""
    ],
    ""nested"": {
      ""thing"": ""bop"",
      ""otherthing"": ""boop""
    }
  }
}
";

        var expectedObject = new Type
        {
            Id = "type-df89sdg1",
            Name = "foo",
            UnknownValue = new Dictionary<object, object?>()
            {
                { "id", "hello" },
                {
                    "listy",
                    new List<object?>() { "hello", "there" }
                },
                {
                    "nested",
                    new Dictionary<object, object?>()
                    {
                        { "otherthing", "boop" },
                        { "thing", "bop" },
                    }
                },
                { "number", "hi" },
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
