using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class FooExtendedTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "name": "example1",
              "age": 5
            }
            """;
        var expectedObject = new FooExtended { Name = "example1", Age = 5 };
        var deserializedObject = JsonUtils.Deserialize<FooExtended>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "name": "example1",
              "age": 5
            }
            """;
        var actualObj = new FooExtended { Name = "example1", Age = 5 };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "name": "example2",
              "age": 10
            }
            """;
        var expectedObject = new FooExtended { Name = "example2", Age = 10 };
        var deserializedObject = JsonUtils.Deserialize<FooExtended>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "name": "example2",
              "age": 10
            }
            """;
        var actualObj = new FooExtended { Name = "example2", Age = 10 };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
