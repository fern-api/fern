using System.Text.Json;
using NUnit.Framework;

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
        var expectedObject = new SeedExamples.Node
        {
            Name = "root",
            Nodes = new List<SeedExamples.Node>()
            {
                new SeedExamples.Node { Name = "left" },
                new SeedExamples.Node { Name = "right" },
            },
            Trees = new List<SeedExamples.Tree>()
            {
                new SeedExamples.Tree
                {
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node { Name = "left" },
                        new SeedExamples.Node { Name = "right" },
                    },
                },
            },
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Node>(json);
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
        var actualObj = new SeedExamples.Node
        {
            Name = "root",
            Nodes = new List<SeedExamples.Node>()
            {
                new SeedExamples.Node { Name = "left" },
                new SeedExamples.Node { Name = "right" },
            },
            Trees = new List<SeedExamples.Tree>()
            {
                new SeedExamples.Tree
                {
                    Nodes = new List<SeedExamples.Node>()
                    {
                        new SeedExamples.Node { Name = "left" },
                        new SeedExamples.Node { Name = "right" },
                    },
                },
            },
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
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
        var expectedObject = new SeedExamples.Node { Name = "left" };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Node>(json);
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
        var actualObj = new SeedExamples.Node { Name = "left" };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
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
        var expectedObject = new SeedExamples.Node { Name = "right" };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Node>(json);
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
        var actualObj = new SeedExamples.Node { Name = "right" };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
