using System.Text.Json;
using NUnit.Framework;
using SeedAliasExtends.Core;

namespace SeedAliasExtends.Test;

[TestFixture]
public class ParentTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "parent": "Property from the parent"
            }
            """;
        var expectedObject = new Parent { Parent_ = "Property from the parent" };
        var deserializedObject = JsonUtils.Deserialize<Parent>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "parent": "Property from the parent"
            }
            """;
        var actualObj = new Parent { Parent_ = "Property from the parent" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
