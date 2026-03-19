using NUnit.Framework;
using SeedUnions;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSingleElementTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSingleElement>(inputJson);
    }
}
