using System.Text.Json;
using NUnit.Framework;
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
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
        var actualObj = new Node
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
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "name": "left"
            }
            """;
        var actualObj = new Node { Name = "left" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "name": "right"
            }
            """;
        var actualObj = new Node { Name = "right" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
