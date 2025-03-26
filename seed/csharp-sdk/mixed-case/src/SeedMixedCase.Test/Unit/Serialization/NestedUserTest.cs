using System.Text.Json;
using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Core;

namespace SeedMixedCase.Test;

[TestFixture]
public class NestedUserTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "Name": "username",
              "NestedUser": {
                "userName": "nestedUsername",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        var expectedObject = new NestedUser
        {
            Name = "username",
            NestedUser_ = new User
            {
                UserName = "nestedUsername",
                MetadataTags = new List<string>() { "tag1", "tag2" },
                ExtraProperties = new Dictionary<string, string>()
                {
                    { "foo", "bar" },
                    { "baz", "qux" },
                },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<NestedUser>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "Name": "username",
              "NestedUser": {
                "userName": "nestedUsername",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        var actualObj = new NestedUser
        {
            Name = "username",
            NestedUser_ = new User
            {
                UserName = "nestedUsername",
                MetadataTags = new List<string>() { "tag1", "tag2" },
                ExtraProperties = new Dictionary<string, string>()
                {
                    { "foo", "bar" },
                    { "baz", "qux" },
                },
            },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
