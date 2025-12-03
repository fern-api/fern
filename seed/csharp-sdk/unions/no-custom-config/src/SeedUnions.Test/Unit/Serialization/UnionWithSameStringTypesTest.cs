using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithSameStringTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "customFormat",
              "value": "custom-123"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.CustomFormat("custom-123")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "customFormat",
              "value": "custom-123"
            }
            """;
        var actualObj = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.CustomFormat("custom-123")
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "regularString",
              "value": "regular text"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.RegularString("regular text")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "regularString",
              "value": "regular text"
            }
            """;
        var actualObj = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.RegularString("regular text")
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "patternString",
              "value": "PATTERN123"
            }
            """;
        var expectedObject = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.PatternString("PATTERN123")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameStringTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "patternString",
              "value": "PATTERN123"
            }
            """;
        var actualObj = new UnionWithSameStringTypes(
            new UnionWithSameStringTypes.PatternString("PATTERN123")
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
