using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class MigrationTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var expectedObject = new SeedExamples.Migration
        {
            Name = "001_init",
            Status = SeedExamples.MigrationStatus.Running,
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Migration>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var actualObj = new SeedExamples.Migration
        {
            Name = "001_init",
            Status = SeedExamples.MigrationStatus.Running,
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
