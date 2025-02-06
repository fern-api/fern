using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExtends;

namespace SeedExtends.Test;

[TestFixture]
public class JsonTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""docs"": ""Types extend this type to include a docs and json property."",
          ""raw"": ""{\""docs\"": true, \""json\"": true}""
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<Json>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
