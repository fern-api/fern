using NUnit.Framework;
using SeedLiteral.Core;

namespace SeedLiteral.Test.Core.Json;

[TestFixture]
public class DateTimeJsonTests
{
    [Test]
    public void SerializeDateTime_ShouldMatchExpectedFormat()
    {
        (DateTime dateTime, string expected)[] testCases =
        [
            (
                new DateTime(2023, 10, 5, 14, 30, 0, DateTimeKind.Utc),
                "\"2023-10-05T14:30:00.000Z\""
            ),
            (new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc), "\"2023-01-01T00:00:00.000Z\""),
            (
                new DateTime(2023, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                "\"2023-12-31T23:59:59.000Z\""
            ),
            (new DateTime(2023, 6, 15, 12, 0, 0, DateTimeKind.Utc), "\"2023-06-15T12:00:00.000Z\""),
            (
                new DateTime(2023, 3, 10, 8, 45, 30, DateTimeKind.Utc),
                "\"2023-03-10T08:45:30.000Z\""
            ),
            (
                new DateTime(2023, 3, 10, 8, 45, 30, 123, DateTimeKind.Utc),
                "\"2023-03-10T08:45:30.123Z\""
            ),
        ];
        foreach (var (dateTime, expected) in testCases)
        {
            var json = JsonUtils.Serialize(dateTime);
            Assert.That(json, Is.EqualTo(expected));
        }
    }

    [Test]
    public void DeserializeDateTime_ShouldMatchExpectedDateTime()
    {
        (DateTime expected, string json)[] testCases =
        [
            (
                new DateTime(2023, 10, 5, 14, 30, 0, DateTimeKind.Utc),
                "\"2023-10-05T14:30:00.000Z\""
            ),
            (new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc), "\"2023-01-01T00:00:00.000Z\""),
            (
                new DateTime(2023, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                "\"2023-12-31T23:59:59.000Z\""
            ),
            (new DateTime(2023, 6, 15, 12, 0, 0, DateTimeKind.Utc), "\"2023-06-15T12:00:00.000Z\""),
            (
                new DateTime(2023, 3, 10, 8, 45, 30, DateTimeKind.Utc),
                "\"2023-03-10T08:45:30.000Z\""
            ),
            (new DateTime(2023, 3, 10, 8, 45, 30, DateTimeKind.Utc), "\"2023-03-10T08:45:30Z\""),
            (
                new DateTime(2023, 3, 10, 8, 45, 30, 123, DateTimeKind.Utc),
                "\"2023-03-10T08:45:30.123Z\""
            ),
        ];

        foreach (var (expected, json) in testCases)
        {
            var dateTime = JsonUtils.Deserialize<DateTime>(json);
            Assert.That(dateTime, Is.EqualTo(expected));
        }
    }

    [Test]
    public void SerializeNullableDateTime_ShouldMatchExpectedFormat()
    {
        (DateTime? expected, string json)[] testCases =
        [
            (
                new DateTime(2023, 10, 5, 14, 30, 0, DateTimeKind.Utc),
                "\"2023-10-05T14:30:00.000Z\""
            ),
            (null, "null"),
        ];

        foreach (var (expected, json) in testCases)
        {
            var dateTime = JsonUtils.Deserialize<DateTime?>(json);
            Assert.That(dateTime, Is.EqualTo(expected));
        }
    }

    [Test]
    public void DeserializeNullableDateTime_ShouldMatchExpectedDateTime()
    {
        (DateTime? expected, string json)[] testCases =
        [
            (
                new DateTime(2023, 10, 5, 14, 30, 0, DateTimeKind.Utc),
                "\"2023-10-05T14:30:00.000Z\""
            ),
            (null, "null"),
        ];

        foreach (var (expected, json) in testCases)
        {
            var dateTime = JsonUtils.Deserialize<DateTime?>(json);
            Assert.That(dateTime, Is.EqualTo(expected));
        }
    }
}
