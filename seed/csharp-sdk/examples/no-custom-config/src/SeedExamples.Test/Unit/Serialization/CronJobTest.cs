using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CronJobTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "expression": "0 */6 * * *"
            }
            """;
        var expectedObject = new CronJob { Expression = "0 */6 * * *" };
        var deserializedObject = JsonUtils.Deserialize<CronJob>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

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
