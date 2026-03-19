using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSameStringTypesTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "customFormat",
              "value": "custom-123"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "regularString",
              "value": "regular text"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "patternString",
              "value": "PATTERN123"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSameStringTypes>(inputJson);
    }
}
