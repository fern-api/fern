using NUnit.Framework;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

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
              },
              "jsonString": "{\"foo\": \"bar\", \"baz\": \"qux\"}"
            }
            """;
        JsonAssert.Roundtrips<Commons.Metadata>(inputJson);
    }
}
