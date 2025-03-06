using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class MetadataTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              },
              "jsonString": "{\"foo\": \"bar\", \"baz\": \"qux\"}"
            }
            """;
        var expectedObject = new Commons.Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
            JsonString = "{\"foo\": \"bar\", \"baz\": \"qux\"}",
        };
        var deserializedObject = JsonUtils.Deserialize<Commons.Metadata>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              },
              "jsonString": "{\"foo\": \"bar\", \"baz\": \"qux\"}"
            }
            """;
        var obj = new Commons.Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
            JsonString = "{\"foo\": \"bar\", \"baz\": \"qux\"}",
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
