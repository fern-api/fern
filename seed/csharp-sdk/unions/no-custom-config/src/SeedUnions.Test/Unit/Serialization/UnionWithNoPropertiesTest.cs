using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithNoPropertiesTest
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
        var expectedObject = new UnionWithNoProperties(
            new UnionWithNoProperties.Foo(new Foo { Name = "example" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithNoProperties>(json);
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
        var actualObj = new UnionWithNoProperties(
            new UnionWithNoProperties.Foo(new Foo { Name = "example" })
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
              "type": "empty"
            }
            """;
        var expectedObject = new UnionWithNoProperties(new UnionWithNoProperties.Empty());
        var deserializedObject = JsonUtils.Deserialize<UnionWithNoProperties>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "empty"
            }
            """;
        var actualObj = new UnionWithNoProperties(new UnionWithNoProperties.Empty());
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
