using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<Foo>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "example2"
            }
            """;
        JsonAssert.Roundtrips<Foo>(inputJson);
    }
}
