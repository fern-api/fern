using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class MetadataTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var expectedObject = new Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
        };
        var deserializedObject = JsonUtils.Deserialize<Metadata>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var obj = new Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
