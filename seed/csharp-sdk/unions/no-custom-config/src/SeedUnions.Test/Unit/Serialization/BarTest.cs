using System.Text.Json;
using NUnit.Framework;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class BarTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "example1"
            }
            """;
        var expectedObject = new Bar { Name = "example1" };
        var deserializedObject = JsonUtils.Deserialize<Bar>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "name": "example1"
            }
            """;
        var actualObj = new Bar { Name = "example1" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "example2"
            }
            """;
        var expectedObject = new Bar { Name = "example2" };
        var deserializedObject = JsonUtils.Deserialize<Bar>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "name": "example2"
            }
            """;
        var actualObj = new Bar { Name = "example2" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
