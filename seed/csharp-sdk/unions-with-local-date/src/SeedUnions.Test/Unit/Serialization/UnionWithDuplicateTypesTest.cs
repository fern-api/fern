using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithDuplicateTypesTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo1",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicateTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "foo2",
              "name": "example2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicateTypes>(inputJson);
    }
}
