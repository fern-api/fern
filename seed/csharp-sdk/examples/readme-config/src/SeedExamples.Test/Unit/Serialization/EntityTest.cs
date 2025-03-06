using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class EntityTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var expectedObject = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var deserializedObject = JsonUtils.Deserialize<Entity>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var obj = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
