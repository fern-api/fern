using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Core;

namespace SeedAliasExtends.Test;

[TestFixture]
public class ParentTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent"
            }
            """;
        var expectedObject = new Parent { Parent_ = "Property from the parent" };
        var deserializedObject = JsonUtils.Deserialize<Parent>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "parent": "Property from the parent"
            }
            """;
        var obj = new Parent { Parent_ = "Property from the parent" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
