using System.Text.Json;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;

namespace SeedExtends.Test;

[TestFixture]
public class ExampleTypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var expectedObject = new ExampleType
        {
            Docs = "This is an example type.",
            Name = "Example",
        };
        var deserializedObject = JsonUtils.Deserialize<ExampleType>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var actualObj = new ExampleType { Docs = "This is an example type.", Name = "Example" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
