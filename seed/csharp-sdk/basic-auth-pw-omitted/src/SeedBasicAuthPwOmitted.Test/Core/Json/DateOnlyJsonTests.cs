using NUnit.Framework;
using SeedBasicAuthPwOmitted.Core;

namespace SeedBasicAuthPwOmitted.Test.Core.Json;

[TestFixture]
public class DateOnlyJsonTests
{
    [Test]
    public void SerializeDateOnly_ShouldMatchExpectedFormat()
    {
        (DateOnly dateOnly, string expected)[] testCases =
        [
            (new DateOnly(2023, 10, 5), "\"2023-10-05\""),
            (new DateOnly(2023, 1, 1), "\"2023-01-01\""),
            (new DateOnly(2023, 12, 31), "\"2023-12-31\""),
            (new DateOnly(2023, 6, 15), "\"2023-06-15\""),
            (new DateOnly(2023, 3, 10), "\"2023-03-10\""),
        ];
        foreach (var (dateOnly, expected) in testCases)
        {
            var json = JsonUtils.Serialize(dateOnly);
            Assert.That(json, Is.EqualTo(expected));
        }
    }

    [Test]
    public void DeserializeDateOnly_ShouldMatchExpectedDateOnly()
    {
        (DateOnly expected, string json)[] testCases =
        [
            (new DateOnly(2023, 10, 5), "\"2023-10-05\""),
            (new DateOnly(2023, 1, 1), "\"2023-01-01\""),
            (new DateOnly(2023, 12, 31), "\"2023-12-31\""),
            (new DateOnly(2023, 6, 15), "\"2023-06-15\""),
            (new DateOnly(2023, 3, 10), "\"2023-03-10\""),
        ];

        foreach (var (expected, json) in testCases)
        {
            var dateOnly = JsonUtils.Deserialize<DateOnly>(json);
            Assert.That(dateOnly, Is.EqualTo(expected));
        }
    }

    [Test]
    public void SerializeNullableDateOnly_ShouldMatchExpectedFormat()
    {
        (DateOnly? dateOnly, string expected)[] testCases =
        [
            (new DateOnly(2023, 10, 5), "\"2023-10-05\""),
            (null, "null"),
        ];
        foreach (var (dateOnly, expected) in testCases)
        {
            var json = JsonUtils.Serialize(dateOnly);
            Assert.That(json, Is.EqualTo(expected));
        }
    }

    [Test]
    public void DeserializeNullableDateOnly_ShouldMatchExpectedDateOnly()
    {
        (DateOnly? expected, string json)[] testCases =
        [
            (new DateOnly(2023, 10, 5), "\"2023-10-05\""),
            (null, "null"),
        ];

        foreach (var (expected, json) in testCases)
        {
            var dateOnly = JsonUtils.Deserialize<DateOnly?>(json);
            Assert.That(dateOnly, Is.EqualTo(expected));
        }
    }

    [Test]
    public void ShouldSerializeDictionaryWithDateOnlyKey()
    {
        var key = new DateOnly(2023, 10, 5);
        var dict = new Dictionary<DateOnly, string> { { key, "value_a" } };
        var json = JsonUtils.Serialize(dict);
        Assert.That(json, Does.Contain("2023-10-05"));
        Assert.That(json, Does.Contain("value_a"));
    }

    [Test]
    public void ShouldDeserializeDictionaryWithDateOnlyKey()
    {
        var json = """
            {
                "2023-10-05": "value_a"
            }
            """;
        var dict = JsonUtils.Deserialize<Dictionary<DateOnly, string>>(json);
        Assert.That(dict, Is.Not.Null);
        var key = new DateOnly(2023, 10, 5);
        Assert.That(dict![key], Is.EqualTo("value_a"));
    }
}
