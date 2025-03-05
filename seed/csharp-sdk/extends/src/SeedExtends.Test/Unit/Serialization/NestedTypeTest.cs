using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class NestedTypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        var expectedObject = new NestedType
        {
            Docs = "This is an example nested type.",
            Name = "NestedExample",
            Raw = "{\"nested\": \"example\"}",
        };
        var deserializedObject = JsonUtils.Deserialize<NestedType>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        var obj = new NestedType
        {
            Docs = "This is an example nested type.",
            Name = "NestedExample",
            Raw = "{\"nested\": \"example\"}",
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
