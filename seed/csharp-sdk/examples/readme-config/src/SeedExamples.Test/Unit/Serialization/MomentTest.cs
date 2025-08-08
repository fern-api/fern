using System.Globalization;
using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class MomentTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
              "date": "1994-01-01",
              "datetime": "1994-01-01T01:01:01Z"
            }
            """;
        var expectedObject = new SeedExamples.Moment
        {
            Id = "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
            Date = new DateOnly(1994, 1, 1),
            Datetime = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Moment>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "id": "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
              "date": "1994-01-01",
              "datetime": "1994-01-01T01:01:01Z"
            }
            """;
        var actualObj = new SeedExamples.Moment
        {
            Id = "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
            Date = new DateOnly(1994, 1, 1),
            Datetime = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
