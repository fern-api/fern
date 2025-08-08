using System.Text.Json;
using NUnit.Framework;

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
        var expectedObject = new SeedExamples.Entity
        {
            Type = SeedExamples.ComplexType.Unknown,
            Name = "unknown",
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Entity>(json);
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
        var actualObj = new SeedExamples.Entity
        {
            Type = SeedExamples.ComplexType.Unknown,
            Name = "unknown",
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
