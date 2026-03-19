using NUnit.Framework;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TestTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "and",
              "value": true
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Test>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "or",
              "value": true
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Test>(inputJson);
    }
}
