using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedExtends;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedExtends.Test;

[TestFixture]
public class ExampleTypeTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""docs"": ""This is an example type."",
          ""name"": ""Example""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<ExampleType>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
