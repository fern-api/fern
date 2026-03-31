using global::System.Globalization;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
        var inputJson = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        JsonAssert.Roundtrips<UnionWithOptionalTime>(inputJson);
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
        var inputJson = """
            {
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        JsonAssert.Roundtrips<UnionWithOptionalTime>(inputJson);
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
        var inputJson = """
            {
              "type": "date",
              "value": null
            }
            """;
        JsonAssert.Roundtrips<UnionWithOptionalTime>(inputJson);
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
        var inputJson = """
            {
              "type": "datetime",
              "value": null
            }
            """;
        JsonAssert.Roundtrips<UnionWithOptionalTime>(inputJson);
    }
}
