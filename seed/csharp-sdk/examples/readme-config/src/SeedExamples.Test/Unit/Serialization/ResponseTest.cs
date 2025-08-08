using System.Text.Json;
using NUnit.Framework;

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
        var expectedObject = new SeedExamples.Response
        {
            Response_ = "Initializing...",
            Identifiers = new List<SeedExamples.Identifier>()
            {
                new SeedExamples.Identifier
                {
                    Type = SeedExamples.BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive",
                },
                new SeedExamples.Identifier
                {
                    Type = SeedExamples.ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown",
                },
            },
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Response>(
            json
        );
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
        var actualObj = new SeedExamples.Response
        {
            Response_ = "Initializing...",
            Identifiers = new List<SeedExamples.Identifier>()
            {
                new SeedExamples.Identifier
                {
                    Type = SeedExamples.BasicType.Primitive,
                    Value = "example",
                    Label = "Primitive",
                },
                new SeedExamples.Identifier
                {
                    Type = SeedExamples.ComplexType.Unknown,
                    Value = "{}",
                    Label = "Unknown",
                },
            },
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
