using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
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
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
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
        var obj = new Response
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
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
