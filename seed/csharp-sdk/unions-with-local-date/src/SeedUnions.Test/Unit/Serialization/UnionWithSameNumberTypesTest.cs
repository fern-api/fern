using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSameNumberTypesTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "positiveInt",
              "value": 100
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "negativeInt",
              "value": -50
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "anyNumber",
              "value": 3.14159
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameNumberTypes>(inputJson);
    }
}
