using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObjectsWithImports.Commons;

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class MetadataTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""id"": ""metadata-js8dg24b"",
          ""data"": {
            ""foo"": ""bar"",
            ""baz"": ""qux""
          }
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<Metadata>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
