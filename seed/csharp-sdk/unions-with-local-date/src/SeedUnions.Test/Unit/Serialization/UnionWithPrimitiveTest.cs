using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithPrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "integer",
              "value": 9
            }
            """;
        var expectedObject = new UnionWithPrimitive(new UnionWithPrimitive.Integer(9));
        var deserializedObject = JsonUtils.Deserialize<UnionWithPrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "integer",
              "value": 9
            }
            """;
        var actualObj = new UnionWithPrimitive(new UnionWithPrimitive.Integer(9));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "string",
              "value": "bar"
            }
            """;
        var expectedObject = new UnionWithPrimitive(new UnionWithPrimitive.String("bar"));
        var deserializedObject = JsonUtils.Deserialize<UnionWithPrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "string",
              "value": "bar"
            }
            """;
        var actualObj = new UnionWithPrimitive(new UnionWithPrimitive.String("bar"));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
