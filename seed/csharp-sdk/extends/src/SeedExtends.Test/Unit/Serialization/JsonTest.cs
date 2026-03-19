using NUnit.Framework;
using SeedExtends;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class JsonTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        JsonAssert.Roundtrips<Json>(inputJson);
    }
}
