using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedUnknownAsAny;

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class MyObjectTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""unknown"": {
            ""boolVal"": true,
            ""strVal"": ""string""
          }
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<MyObject>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
