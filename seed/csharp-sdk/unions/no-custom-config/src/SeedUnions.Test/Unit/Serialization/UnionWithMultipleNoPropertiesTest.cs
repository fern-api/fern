using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithMultipleNoPropertiesTest
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
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "empty1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "empty2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithMultipleNoProperties>(inputJson);
    }
}
