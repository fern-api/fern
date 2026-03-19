using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithTimeTest
{
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
