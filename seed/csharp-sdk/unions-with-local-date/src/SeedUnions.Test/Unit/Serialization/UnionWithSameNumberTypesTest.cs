using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithSameNumberTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "positiveInt",
              "value": 100
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.PositiveInt(100)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "positiveInt",
              "value": 100
            }
            """;
        var actualObj = new UnionWithSameNumberTypes(new UnionWithSameNumberTypes.PositiveInt(100));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "negativeInt",
              "value": -50
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.NegativeInt(-50)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "negativeInt",
              "value": -50
            }
            """;
        var actualObj = new UnionWithSameNumberTypes(new UnionWithSameNumberTypes.NegativeInt(-50));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "anyNumber",
              "value": 3.14159
            }
            """;
        var expectedObject = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.AnyNumber(3.14159)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSameNumberTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "anyNumber",
              "value": 3.14159
            }
            """;
        var actualObj = new UnionWithSameNumberTypes(
            new UnionWithSameNumberTypes.AnyNumber(3.14159)
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
