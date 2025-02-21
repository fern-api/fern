using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObject;

namespace SeedObject.Test;

[TestFixture]
public class NameTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""id"": ""name-sdfg8ajk"",
          ""value"": ""name""
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<Name>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
