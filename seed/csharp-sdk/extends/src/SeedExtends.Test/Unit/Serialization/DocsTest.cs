using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedExtends;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedExtends.Test;

[TestFixture]
public class DocsTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""docs"": ""Types extend this type to include a docs property.""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Docs>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
