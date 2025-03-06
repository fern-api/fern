using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test;

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
                  "id": "node-8dvgfja2",
                  "label": "left",
                  "metadata": {
                    "id": "metadata-kjasf923",
                    "data": {
                      "foo": "bar",
                      "baz": "qux"
                    }
                  }
                },
                {
                  "id": "node-cwda9fi2x",
                  "label": "right",
                  "metadata": {
                    "id": "metadata-lkasdfv9j",
                    "data": {
                      "one": "two",
                      "three": "four"
                    }
                  }
                }
              ]
            }
            """;
        var expectedObject = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node
                {
                    Id = "node-8dvgfja2",
                    Label = "left",
                    Metadata = new Metadata
                    {
                        Id = "metadata-kjasf923",
                        Data = new Dictionary<string, string>()
                        {
                            { "foo", "bar" },
                            { "baz", "qux" },
                        },
                    },
                },
                new Node
                {
                    Id = "node-cwda9fi2x",
                    Label = "right",
                    Metadata = new Metadata
                    {
                        Id = "metadata-lkasdfv9j",
                        Data = new Dictionary<string, string>()
                        {
                            { "one", "two" },
                            { "three", "four" },
                        },
                    },
                },
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
                  "id": "node-8dvgfja2",
                  "label": "left",
                  "metadata": {
                    "id": "metadata-kjasf923",
                    "data": {
                      "foo": "bar",
                      "baz": "qux"
                    }
                  }
                },
                {
                  "id": "node-cwda9fi2x",
                  "label": "right",
                  "metadata": {
                    "id": "metadata-lkasdfv9j",
                    "data": {
                      "one": "two",
                      "three": "four"
                    }
                  }
                }
              ]
            }
            """;
        var obj = new Tree
        {
            Nodes = new List<Node>()
            {
                new Node
                {
                    Id = "node-8dvgfja2",
                    Label = "left",
                    Metadata = new Metadata
                    {
                        Id = "metadata-kjasf923",
                        Data = new Dictionary<string, string>()
                        {
                            { "foo", "bar" },
                            { "baz", "qux" },
                        },
                    },
                },
                new Node
                {
                    Id = "node-cwda9fi2x",
                    Label = "right",
                    Metadata = new Metadata
                    {
                        Id = "metadata-lkasdfv9j",
                        Data = new Dictionary<string, string>()
                        {
                            { "one", "two" },
                            { "three", "four" },
                        },
                    },
                },
            },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
