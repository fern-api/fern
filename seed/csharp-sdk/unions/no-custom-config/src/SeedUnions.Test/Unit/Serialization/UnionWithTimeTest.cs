using System.Globalization;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
        var inputJson = """
            {
              "type": "value",
              "value": 5
            }
            """;
        JsonAssert.Roundtrips<UnionWithTime>(inputJson);
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
        var inputJson = """
            {
              "type": "date",
              "value": "1994-01-01"
            }
            """;
        JsonAssert.Roundtrips<UnionWithTime>(inputJson);
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
        var inputJson = """
            {
              "type": "datetime",
              "value": "1994-01-01T01:01:01Z"
            }
            """;
        JsonAssert.Roundtrips<UnionWithTime>(inputJson);
    }
}
