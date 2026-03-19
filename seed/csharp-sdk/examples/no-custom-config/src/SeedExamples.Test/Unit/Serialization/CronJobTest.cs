using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CronJobTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "expression": "0 */6 * * *"
            }
            """;
        JsonAssert.Roundtrips<CronJob>(inputJson);
    }
}
