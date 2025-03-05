using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class MyObjectTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var expectedObject = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<MyObject>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var obj = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
