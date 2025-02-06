using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

namespace SeedExamples.Test;

[TestFixture]
public class ResponseTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""response"": ""Initializing..."",
          ""identifiers"": [
            {
              ""type"": ""primitive"",
              ""value"": ""example"",
              ""label"": ""Primitive""
            },
            {
              ""type"": ""unknown"",
              ""value"": ""{}"",
              ""label"": ""Unknown""
            }
          ]
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<Response>(inputJson, serializerOptions);

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
