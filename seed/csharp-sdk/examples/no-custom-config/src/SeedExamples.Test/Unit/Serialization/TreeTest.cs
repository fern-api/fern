using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class TreeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ]
            }
            """;
        var expectedObject = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Tree>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ]
            }
            """;
        var obj = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" },
            },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
