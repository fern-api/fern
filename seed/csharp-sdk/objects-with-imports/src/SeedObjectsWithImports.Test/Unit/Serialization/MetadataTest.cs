using NUnit.Framework;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MetadataTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        JsonAssert.Roundtrips<Metadata>(inputJson);
    }
}
