using NUnit.Framework;
using SeedExtends;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DocsTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        JsonAssert.Roundtrips<Docs>(inputJson);
    }
}
