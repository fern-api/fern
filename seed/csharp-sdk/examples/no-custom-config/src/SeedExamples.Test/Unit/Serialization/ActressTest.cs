using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class ActressTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var expectedObject = new Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var deserializedObject = JsonUtils.Deserialize<Actress>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var obj = new Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
