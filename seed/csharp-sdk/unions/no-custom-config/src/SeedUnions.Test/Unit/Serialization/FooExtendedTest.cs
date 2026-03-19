using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooExtendedTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "example1",
              "age": 5
            }
            """;
        JsonAssert.Roundtrips<FooExtended>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "example2",
              "age": 10
            }
            """;
        JsonAssert.Roundtrips<FooExtended>(inputJson);
    }
}
