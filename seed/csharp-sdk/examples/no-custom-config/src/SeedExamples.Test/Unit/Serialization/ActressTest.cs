using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class ActressTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var expectedObject = new Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var deserializedObject = JsonUtils.Deserialize<Actress>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var actualObj = new Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
