using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedValidation;

namespace SeedValidation.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""decimal"": 1.1,
          ""even"": 2,
          ""name"": ""rules"",
          ""shape"": ""SQUARE""
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
