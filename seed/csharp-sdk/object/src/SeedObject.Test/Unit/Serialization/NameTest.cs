using System.Text.Json;
using NUnit.Framework;
using SeedObject.Core;

namespace SeedObject.Test;

[TestFixture]
public class NameTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var expectedObject = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var deserializedObject = JsonUtils.Deserialize<Name>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        var actualObj = new Name { Id = "name-sdfg8ajk", Value = "name" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
