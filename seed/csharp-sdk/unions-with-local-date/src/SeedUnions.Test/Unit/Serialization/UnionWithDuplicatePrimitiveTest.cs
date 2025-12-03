using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithDuplicatePrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer1(9)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        var actualObj = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer1(9)
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
              "type": "integer2",
              "value": 5
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer2(5)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "integer2",
              "value": 5
            }
            """;
        var actualObj = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer2(5)
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
              "type": "string1",
              "value": "bar1"
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar1")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "string1",
              "value": "bar1"
            }
            """;
        var actualObj = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar1")
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_4()
    {
        var json = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar2")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_4()
    {
        var expectedJson = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        var actualObj = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar2")
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
