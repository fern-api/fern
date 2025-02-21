using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;
using SeedObject.Core;

namespace SeedObject.Test.Core.Json;

[TestFixture]
public class DateAsDateTimeJsonTests
{
    private class Foo
    {
        [JsonPropertyName("date")]
        [DateAsDateTime]
        public DateTime Date { get; set; }
    }

    [Test]
    public void SerializeDateTimeAsDate_ShouldMatchExpectedFormat()
    {
        (Foo foo, string expected)[] testCases =
        [
            (new Foo { Date = new DateTime(2023, 10, 5) }, "2023-10-05"),
            (new Foo { Date = new DateTime(2023, 1, 1) }, "2023-01-01"),
            (new Foo { Date = new DateTime(2023, 12, 31) }, "2023-12-31"),
            (new Foo { Date = new DateTime(2023, 6, 15) }, "2023-06-15"),
            (new Foo { Date = new DateTime(2023, 3, 10) }, "2023-03-10"),
        ];
        foreach (var (foo, expected) in testCases)
        {
            var json = JsonUtils.Serialize(foo);
            var jsonElement = JsonUtils.Deserialize<JsonElement>(json);
            Assert.That(jsonElement.GetProperty("date").GetString(), Is.EqualTo(expected));
        }
    }

    [Test]
    public void DeserializeDateTimeAsDate_ShouldMatchExpectedDateTime()
    {
        (Foo expected, string json)[] testCases =
        [
            (new Foo { Date = new DateTime(2023, 10, 5) }, "{\"date\":\"2023-10-05\"}"),
            (new Foo { Date = new DateTime(2023, 1, 1) }, "{\"date\":\"2023-01-01\"}"),
            (new Foo { Date = new DateTime(2023, 12, 31) }, "{\"date\":\"2023-12-31\"}"),
            (new Foo { Date = new DateTime(2023, 6, 15) }, "{\"date\":\"2023-06-15\"}"),
            (new Foo { Date = new DateTime(2023, 3, 10) }, "{\"date\":\"2023-03-10\"}"),
        ];

        foreach (var (expected, json) in testCases)
        {
            var foo = JsonUtils.Deserialize<Foo>(json);
            Assert.That(foo.Date, Is.EqualTo(expected.Date));
        }
    }
}
