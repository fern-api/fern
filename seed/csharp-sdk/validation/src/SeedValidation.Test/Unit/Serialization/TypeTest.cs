using NUnit.Framework;
using SeedValidation.Test.Utils;

namespace SeedValidation.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TypeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "decimal": 1.1,
              "even": 2,
              "name": "rules",
              "shape": "SQUARE"
            }
            """;
        JsonAssert.Roundtrips<SeedValidation.Type>(inputJson);
    }
}
