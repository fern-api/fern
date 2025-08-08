using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class ActressTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var expectedObject = new SeedExamples.Actress
        {
            Name = "Jennifer Lawrence",
            Id = "actor_456",
        };
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Actress>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var actualObj = new SeedExamples.Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
