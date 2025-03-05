using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class NodeTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "root",
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ],
              "trees": [
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
              ]
            }
            """;
        var expectedObject = new Node
        {
            Name = "root",
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" },
            },
            Trees = new List<Tree>()
            {
                new Tree
                {
                    Nodes = new List<Node>()
                    {
                        new Node { Name = "left" },
                        new Node { Name = "right" },
                    },
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Node>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_1()
    {
        var json = """
            {
              "name": "root",
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ],
              "trees": [
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
              ]
            }
            """;
        var obj = new Node
        {
            Name = "root",
            Nodes = new List<Node>()
            {
                new Node { Name = "left" },
                new Node { Name = "right" },
            },
            Trees = new List<Tree>()
            {
                new Tree
                {
                    Nodes = new List<Node>()
                    {
                        new Node { Name = "left" },
                        new Node { Name = "right" },
                    },
                },
            },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }

    [Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "left"
            }
            """;
        var expectedObject = new Node { Name = "left" };
        var deserializedObject = JsonUtils.Deserialize<Node>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_2()
    {
        var json = """
            {
              "name": "left"
            }
            """;
        var obj = new Node { Name = "left" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }

    [Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "name": "right"
            }
            """;
        var expectedObject = new Node { Name = "right" };
        var deserializedObject = JsonUtils.Deserialize<Node>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_3()
    {
        var json = """
            {
              "name": "right"
            }
            """;
        var obj = new Node { Name = "right" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
