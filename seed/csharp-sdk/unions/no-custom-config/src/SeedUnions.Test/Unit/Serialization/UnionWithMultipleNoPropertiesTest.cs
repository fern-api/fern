using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithMultipleNoPropertiesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo",
              "name": "example"
            }
            """;
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Foo(new Foo { Name = "example" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "foo",
              "name": "example"
            }
            """;
        var actualObj = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Foo(new Foo { Name = "example" })
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "empty1"
            }
            """;
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty1()
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "empty1"
            }
            """;
        var actualObj = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty1()
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "empty2"
            }
            """;
        var expectedObject = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty2()
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithMultipleNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var expectedJson = """
            {
              "type": "empty2"
            }
            """;
        var actualObj = new UnionWithMultipleNoProperties(
            new UnionWithMultipleNoProperties.Empty2()
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
