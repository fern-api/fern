using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class MigrationTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var expectedObject = new Migration { Name = "001_init", Status = MigrationStatus.Running };
        var deserializedObject = JsonUtils.Deserialize<Migration>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var actualObj = new Migration { Name = "001_init", Status = MigrationStatus.Running };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
