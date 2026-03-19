using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MigrationTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        JsonAssert.Roundtrips<Migration>(inputJson);
    }
}
