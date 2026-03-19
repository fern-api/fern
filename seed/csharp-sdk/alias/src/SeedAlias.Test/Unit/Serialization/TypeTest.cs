using NUnit.Framework;
using SeedAlias.Test.Utils;

namespace SeedAlias.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TypeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "type-df89sdg1",
              "name": "foo"
            }
            """;
        JsonAssert.Roundtrips<SeedAlias.Type>(inputJson);
    }
}
