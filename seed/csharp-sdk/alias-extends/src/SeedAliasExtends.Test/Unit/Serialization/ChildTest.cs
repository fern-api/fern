using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedAliasExtends;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedAliasExtends.Test;

[TestFixture]
public class ChildTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""parent"": ""Property from the parent"",
          ""child"": ""Property from the child""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Child>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
