using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSubTypesTest
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
        JsonAssert.Roundtrips<UnionWithSubTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "fooExtended",
              "name": "example2",
              "age": 5
            }
            """;
        JsonAssert.Roundtrips<UnionWithSubTypes>(inputJson);
    }
}
