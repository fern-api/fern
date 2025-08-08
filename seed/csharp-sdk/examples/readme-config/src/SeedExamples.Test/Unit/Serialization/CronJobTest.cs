using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class CronJobTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "expression": "0 */6 * * *"
            }
            """;
        var expectedObject = new SeedExamples.CronJob { Expression = "0 */6 * * *" };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.CronJob>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "expression": "0 */6 * * *"
            }
            """;
        var actualObj = new SeedExamples.CronJob { Expression = "0 */6 * * *" };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
