using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class ExampleTypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var expectedObject = new ExampleType
        {
            Docs = "This is an example type.",
            Name = "Example",
        };
        var deserializedObject = JsonUtils.Deserialize<ExampleType>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var obj = new ExampleType { Docs = "This is an example type.", Name = "Example" };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
