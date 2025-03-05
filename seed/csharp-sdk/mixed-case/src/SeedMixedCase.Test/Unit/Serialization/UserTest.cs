using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;

namespace SeedMixedCase.Test;

[TestFixture]
public class UserTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var expectedObject = new User
        {
            UserName = "username",
            MetadataTags = new List<string>() { "tag1", "tag2" },
            ExtraProperties = new Dictionary<string, string>()
            {
                { "foo", "bar" },
                { "baz", "qux" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<User>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var obj = new User
        {
            UserName = "username",
            MetadataTags = new List<string>() { "tag1", "tag2" },
            ExtraProperties = new Dictionary<string, string>()
            {
                { "foo", "bar" },
                { "baz", "qux" },
            },
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
