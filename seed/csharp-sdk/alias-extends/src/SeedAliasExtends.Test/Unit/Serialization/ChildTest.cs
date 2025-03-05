using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Core;

namespace SeedAliasExtends.Test;

[TestFixture]
public class ChildTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        var expectedObject = new Child
        {
            Parent = "Property from the parent",
            Child_ = "Property from the child",
        };
        var deserializedObject = JsonUtils.Deserialize<Child>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        var obj = new Child
        {
            Parent = "Property from the parent",
            Child_ = "Property from the child",
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
