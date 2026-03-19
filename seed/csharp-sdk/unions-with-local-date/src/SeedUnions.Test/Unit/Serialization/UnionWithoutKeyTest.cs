using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithoutKeyTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithoutKey>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "bar",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithoutKey>(inputJson);
    }
}
