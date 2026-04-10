using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NodeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
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
            }
            """;
        var expectedObject = new Node
        {
            Id = "node-8dvgfja2",
            Label = "left",
            Metadata = new Metadata
            {
                Id = "metadata-kjasf923",
                Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
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
              "id": "node-8dvgfja2",
              "label": "left",
              "metadata": {
                "id": "metadata-kjasf923",
                "data": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
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
            """;
        var expectedObject = new Node
        {
            Id = "node-cwda9fi2x",
            Label = "right",
            Metadata = new Metadata
            {
                Id = "metadata-lkasdfv9j",
                Data = new Dictionary<string, string>() { { "one", "two" }, { "three", "four" } },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<Node>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
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
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }
}
