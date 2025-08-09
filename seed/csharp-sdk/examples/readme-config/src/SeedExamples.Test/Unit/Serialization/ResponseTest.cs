using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class ResponseTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "response": "Initializing...",
              "identifiers": [
                {
                  "type": "primitive",
                  "value": "example",
                  "label": "Primitive"
                },
                {
                  "type": "unknown",
                  "value": "{}",
                  "label": "Unknown"
                }
              ]
            }
            """;
        var expectedObject = new Response
        {
            Response_ = "Initializing...",
            Identifiers = new List<Identifier>()
            {
                new Identifier
                {
                    Type = BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive",
                },
                new Identifier
                {
                    Type = ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown",
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Response>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "response": "Initializing...",
              "identifiers": [
                {
                  "type": "primitive",
                  "value": "example",
                  "label": "Primitive"
                },
                {
                  "type": "unknown",
                  "value": "{}",
                  "label": "Unknown"
                }
              ]
            }
            """;
        var actualObj = new Response
        {
            Response_ = "Initializing...",
            Identifiers = new List<Identifier>()
            {
                new Identifier
                {
                    Type = BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive",
                },
                new Identifier
                {
                    Type = ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown",
                },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
