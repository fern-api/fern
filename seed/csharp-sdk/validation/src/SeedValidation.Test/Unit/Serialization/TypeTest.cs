using System.Text.Json;
using NUnit.Framework;
using SeedValidation;
using SeedValidation.Core;

namespace SeedValidation.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        var expectedObject = new Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules",
            Shape = Shape.Square,
        };
        var deserializedObject = JsonUtils.Deserialize<Type>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        var actualObj = new Type
        {
            Decimal = 1.1,
            Even = 2,
            Name = "rules",
            Shape = Shape.Square,
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
