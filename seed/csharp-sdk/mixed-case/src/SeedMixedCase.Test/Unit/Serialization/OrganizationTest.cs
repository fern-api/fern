using NUnit.Framework;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeedMixedCase;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;

    namespace SeedMixedCase.Test;

[TestFixture]
public class OrganizationTest
{
    [Test]
    public void TestSerialization() {
        var inputJson = 
        @"
        {
          ""name"": ""orgName""
        }
        ";

        var serializerOptions  = new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
        
        var deserializedObject = JsonSerializer.Deserialize<Organization>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }

}
