using System.Text.Json;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class NestedTypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        var expectedObject = new NestedType
        {
            Docs = "This is an example nested type.",
            Name = "NestedExample",
            Raw = "{\"nested\": \"example\"}",
        };
        var deserializedObject = JsonUtils.Deserialize<NestedType>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        var actualObj = new NestedType
        {
            Docs = "This is an example nested type.",
            Name = "NestedExample",
            Raw = "{\"nested\": \"example\"}",
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
