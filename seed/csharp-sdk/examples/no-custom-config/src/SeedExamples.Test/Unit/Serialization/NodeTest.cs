using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NodeTest
{
    [NUnit.Framework.Test]
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

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
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
        JsonAssert.Roundtrips<Node>(inputJson);
    }

    [NUnit.Framework.Test]
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

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "left"
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }

    [NUnit.Framework.Test]
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

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "name": "right"
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }
}
