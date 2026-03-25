using global::System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TreeTest
{
    [NUnit.Framework.Test]
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
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
        JsonAssert.Roundtrips<Tree>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
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
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<Tree>(json, options);
        JsonAssert.AreEqual(deserializedObject!, json, options);
    }
}
