using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedExamples;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedExamples.Test;

[TestFixture]
public class ActressTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""name"": ""Jennifer Lawrence"",
          ""id"": ""actor_456""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Actress>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
