using System.Globalization;
using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

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
        var expectedObject = new Moment
        {
            Id = "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
            Date = new DateOnly(1994, 1, 1),
            Datetime = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
        };
        var deserializedObject = JsonUtils.Deserialize<Moment>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "id": "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
              "date": "1994-01-01",
              "datetime": "1994-01-01T01:01:01Z"
            }
            """;
        var obj = new Moment
        {
            Id = "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
            Date = new DateOnly(1994, 1, 1),
            Datetime = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
