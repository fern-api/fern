using System.Globalization;
using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithOptionalTimeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        var expectedObject = new UnionWithOptionalTime(
            new UnionWithOptionalTime.Date(new DateOnly(1994, 1, 1))
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithOptionalTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        var actualObj = new UnionWithOptionalTime(
            new UnionWithOptionalTime.Date(new DateOnly(1994, 1, 1))
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
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        var expectedObject = new UnionWithOptionalTime(
            new UnionWithOptionalTime.Datetime(
                DateTime.Parse("1994-01-01T01:01:01.000Z", null, DateTimeStyles.AdjustToUniversal)
            )
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithOptionalTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        var actualObj = new UnionWithOptionalTime(
            new UnionWithOptionalTime.Datetime(
                DateTime.Parse("1994-01-01T01:01:01.000Z", null, DateTimeStyles.AdjustToUniversal)
            )
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
              "type": "date",
              "value": null
            }
            """;
        var expectedObject = new UnionWithOptionalTime(new UnionWithOptionalTime.Date(null));
        var deserializedObject = JsonUtils.Deserialize<UnionWithOptionalTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "date",
              "value": null
            }
            """;
        var actualObj = new UnionWithOptionalTime(new UnionWithOptionalTime.Date(null));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_4()
    {
        var json = """
            {
              "type": "datetime",
              "value": null
            }
            """;
        var expectedObject = new UnionWithOptionalTime(new UnionWithOptionalTime.Datetime(null));
        var deserializedObject = JsonUtils.Deserialize<UnionWithOptionalTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_4()
    {
        var expectedJson = """
            {
              "type": "datetime",
              "value": null
            }
            """;
        var actualObj = new UnionWithOptionalTime(new UnionWithOptionalTime.Datetime(null));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
