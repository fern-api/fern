using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithDuplicatePrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "integer2",
              "value": 5
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "string1",
              "value": "bar1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_4()
    {
        var inputJson = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }
}
