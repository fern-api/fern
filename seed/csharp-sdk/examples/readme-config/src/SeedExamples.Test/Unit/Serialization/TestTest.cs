using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class TestTest
{
    [Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "and",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new SeedExamples.Test.And(true));
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "and",
              "value": true
            }
            """;
        var actualObj = new SeedExamples.Test(new SeedExamples.Test.And(true));
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "or",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new SeedExamples.Test.Or(true));
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "or",
              "value": true
            }
            """;
        var actualObj = new SeedExamples.Test(new SeedExamples.Test.Or(true));
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
