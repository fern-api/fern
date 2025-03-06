using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedObject;
using SeedObject.Core;

namespace SeedObject.Test;

[TestFixture]
public class NameTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var expectedObject = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var deserializedObject = JsonUtils.Deserialize<Name>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var obj = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
