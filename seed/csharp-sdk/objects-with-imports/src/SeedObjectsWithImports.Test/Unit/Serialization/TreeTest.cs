using System.Text.Json;
using NUnit.Framework;
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
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
        var actualObj = new Tree
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
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
