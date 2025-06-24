using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class TestTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "and",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new Test.And(true));
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "and",
              "value": true
            }
            """;
        var actualObj = new SeedExamples.Test(new Test.And(true));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "or",
              "value": true
            }
            """;
        var expectedObject = new SeedExamples.Test(new Test.Or(true));
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.Test>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "or",
              "value": true
            }
            """;
        var actualObj = new SeedExamples.Test(new Test.Or(true));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
