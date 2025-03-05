using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class RequestTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "request": {}
            }
            """;
        var expectedObject = new Request { Request_ = new Dictionary<object, object?>() { } };
        var deserializedObject = JsonUtils.Deserialize<Request>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "request": {}
            }
            """;
        var obj = new Request { Request_ = new Dictionary<object, object?>() { } };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
