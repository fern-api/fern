using NUnit.Framework;
using SeedObject;
using SeedObject.Test.Utils;

namespace SeedObject.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NameTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "name-sdfg8ajk",
              "value": "name"
            }
            """;
        JsonAssert.Roundtrips<Name>(inputJson);
    }
}
