using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedObject;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedObject.Test;

[TestFixture]
public class NameTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""id"": ""name-sdfg8ajk"",
          ""value"": ""name""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Name>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
