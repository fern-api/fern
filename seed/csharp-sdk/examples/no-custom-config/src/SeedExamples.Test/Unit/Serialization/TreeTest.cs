using System.Text.Json;
using NUnit.Framework;

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
        var expectedObject = new SeedExamples.Tree
        {
            Nodes = new List<SeedExamples.Node>()
            {
                new SeedExamples.Node { Name = "left" },
                new SeedExamples.Node { Name = "right" },
            },
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Tree>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
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
        var actualObj = new SeedExamples.Tree
        {
            Nodes = new List<SeedExamples.Node>()
            {
                new SeedExamples.Node { Name = "left" },
                new SeedExamples.Node { Name = "right" },
            },
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
