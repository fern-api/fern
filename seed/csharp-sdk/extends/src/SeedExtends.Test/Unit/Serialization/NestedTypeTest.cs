using NUnit.Framework;
using SeedExtends;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NestedTypeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "This is an example nested type.",
              "name": "NestedExample",
              "raw": "{\"nested\": \"example\"}"
            }
            """;
        JsonAssert.Roundtrips<NestedType>(inputJson);
    }
}
