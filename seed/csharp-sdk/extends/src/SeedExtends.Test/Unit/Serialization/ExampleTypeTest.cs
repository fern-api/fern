using NUnit.Framework;
using SeedExtends;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExampleTypeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        JsonAssert.Roundtrips<ExampleType>(inputJson);
    }
}
