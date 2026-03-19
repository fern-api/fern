using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithPrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "integer",
              "value": 9
            }
            """;
        JsonAssert.Roundtrips<UnionWithPrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "string",
              "value": "bar"
            }
            """;
        JsonAssert.Roundtrips<UnionWithPrimitive>(inputJson);
    }
}
