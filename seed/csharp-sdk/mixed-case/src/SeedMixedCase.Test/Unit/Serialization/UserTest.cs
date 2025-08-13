using System.Text.Json;
using NUnit.Framework;
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
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
        var actualObj = new User
        {
            UserName = "username",
            MetadataTags = new List<string>() { "tag1", "tag2" },
            ExtraProperties = new Dictionary<string, string>()
            {
                { "foo", "bar" },
                { "baz", "qux" },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
