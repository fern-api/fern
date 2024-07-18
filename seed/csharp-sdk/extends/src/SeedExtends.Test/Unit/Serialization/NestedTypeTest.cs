using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExtends;

#nullable enable

namespace SeedExtends.Test;

[TestFixture]
public class NestedTypeTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
  ""docs"": ""This is an example nested type."",
  ""name"": ""NestedExample"",
  ""raw"": ""{\""nested\"": \""example\""}""
}
";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<NestedType>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
