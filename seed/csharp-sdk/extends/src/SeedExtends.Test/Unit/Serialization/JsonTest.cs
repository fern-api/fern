using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class JsonTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var expectedObject = new Json
        {
            Docs = "Types extend this type to include a docs and json property.",
            Raw = "{\"docs\": true, \"json\": true}",
        };
        var deserializedObject = JsonUtils.Deserialize<Json>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var obj = new Json
        {
            Docs = "Types extend this type to include a docs and json property.",
            Raw = "{\"docs\": true, \"json\": true}",
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
