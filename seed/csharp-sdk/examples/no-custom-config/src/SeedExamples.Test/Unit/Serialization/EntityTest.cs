using System.Text.Json;
using NUnit.Framework;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class EntityTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var expectedObject = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var deserializedObject = JsonUtils.Deserialize<Entity>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var actualObj = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
