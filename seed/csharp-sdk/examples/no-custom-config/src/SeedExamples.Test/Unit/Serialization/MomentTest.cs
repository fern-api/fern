using global::System.Globalization;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MomentTest
{
    [NUnit.Framework.Test]
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
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "656f12d6-f592-444c-a1d3-a3cfd46d5b39",
              "date": "1994-01-01",
              "datetime": "1994-01-01T01:01:01Z"
            }
            """;
        JsonAssert.Roundtrips<Moment>(inputJson);
    }
}
