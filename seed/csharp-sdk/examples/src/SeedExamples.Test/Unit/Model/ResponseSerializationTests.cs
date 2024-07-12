using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class ResponseSerializationTests
{
    [Test]
    public void ResponseSerializationTest()
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

        var expectedObject = new Response
        {
            Response_ = "default_unknown",
            Identifiers = new List<Identifier>()
            {
                new Identifier
                {
                    Type = BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive"
                },
                new Identifier
                {
                    Type = ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown"
                }
            }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Response>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
