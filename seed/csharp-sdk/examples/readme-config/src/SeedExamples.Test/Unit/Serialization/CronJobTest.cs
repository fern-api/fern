using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
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
        var expectedJson = """
            {
              "expression": "0 */6 * * *"
            }
            """;
        var actualObj = new CronJob { Expression = "0 */6 * * *" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
