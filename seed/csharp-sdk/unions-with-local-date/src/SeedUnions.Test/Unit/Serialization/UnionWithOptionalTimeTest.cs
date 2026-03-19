using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithOptionalTimeTest
{
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
