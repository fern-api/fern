using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class ThankfulFactorTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "value": "example1"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example1" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "value": "example1"
            }
            """;
        var actualObj = new ThankfulFactor { Value = "example1" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "value": "example2"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example2" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "value": "example2"
            }
            """;
        var actualObj = new ThankfulFactor { Value = "example2" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "value": "example3"
            }
            """;
        var expectedObject = new ThankfulFactor { Value = "example3" };
        var deserializedObject = JsonUtils.Deserialize<ThankfulFactor>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "value": "example3"
            }
            """;
        var actualObj = new ThankfulFactor { Value = "example3" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
