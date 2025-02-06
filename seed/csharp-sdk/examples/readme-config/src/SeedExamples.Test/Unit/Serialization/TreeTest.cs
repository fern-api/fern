using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedExamples;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedExamples.Test;

[TestFixture]
public class TreeTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""nodes"": [
            {
              ""name"": ""left""
            },
            {
              ""name"": ""right""
            }
          ]
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Tree>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
