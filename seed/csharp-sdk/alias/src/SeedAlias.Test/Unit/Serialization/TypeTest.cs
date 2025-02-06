using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedAlias;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedAlias.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""id"": ""type-df89sdg1"",
          ""name"": ""foo""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
