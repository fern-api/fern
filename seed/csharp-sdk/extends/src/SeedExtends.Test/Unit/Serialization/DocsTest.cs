using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class DocsTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        var expectedObject = new Docs
        {
            Docs_ = "Types extend this type to include a docs property.",
        };
        var deserializedObject = JsonUtils.Deserialize<Docs>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        var obj = new Docs { Docs_ = "Types extend this type to include a docs property." };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
