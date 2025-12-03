using System.Globalization;
using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithTimeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "value",
              "value": 5
            }
            """;
        var expectedObject = new UnionWithTime(new UnionWithTime.ValueInner(5));
        var deserializedObject = JsonUtils.Deserialize<UnionWithTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "value",
              "value": 5
            }
            """;
        var actualObj = new UnionWithTime(new UnionWithTime.ValueInner(5));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        var expectedObject = new UnionWithTime(new UnionWithTime.Date(new DateOnly(1994, 1, 1)));
        var deserializedObject = JsonUtils.Deserialize<UnionWithTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        var actualObj = new UnionWithTime(new UnionWithTime.Date(new DateOnly(1994, 1, 1)));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        var expectedObject = new UnionWithTime(
            new UnionWithTime.Datetime(
                DateTime.Parse("1994-01-01T01:01:01.000Z", null, DateTimeStyles.AdjustToUniversal)
            )
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithTime>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        var actualObj = new UnionWithTime(
            new UnionWithTime.Datetime(
                DateTime.Parse("1994-01-01T01:01:01.000Z", null, DateTimeStyles.AdjustToUniversal)
            )
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
