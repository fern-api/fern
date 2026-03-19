using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithNoPropertiesTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example"
            }
            """;
        JsonAssert.Roundtrips<UnionWithNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "empty"
            }
            """;
        JsonAssert.Roundtrips<UnionWithNoProperties>(inputJson);
    }
}
