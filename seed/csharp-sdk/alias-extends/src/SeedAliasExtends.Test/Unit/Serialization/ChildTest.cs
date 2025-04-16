using System.Text.Json;
using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Core;

namespace SeedAliasExtends.Test;

[TestFixture]
public class ChildTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        var expectedObject = new Child
        {
            Parent = "Property from the parent",
            Child_ = "Property from the child",
        };
        var deserializedObject = JsonUtils.Deserialize<Child>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        var actualObj = new Child
        {
            Parent = "Property from the parent",
            Child_ = "Property from the child",
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
