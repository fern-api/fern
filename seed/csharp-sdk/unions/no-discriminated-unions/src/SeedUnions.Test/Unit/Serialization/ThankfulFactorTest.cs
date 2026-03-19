using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ThankfulFactorTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "value": "example1"
            }
            """;
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "value": "example2"
            }
            """;
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "value": "example3"
            }
            """;
        JsonAssert.Roundtrips<ThankfulFactor>(inputJson);
    }
}
