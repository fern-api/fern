using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Test.Utils;

namespace SeedUnknownAsAny.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MyObjectTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        JsonAssert.Roundtrips<MyObject>(inputJson);
    }
}
