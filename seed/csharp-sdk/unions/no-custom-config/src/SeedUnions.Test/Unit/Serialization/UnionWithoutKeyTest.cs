using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithoutKeyTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithoutKey(
            new UnionWithoutKey.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithoutKey>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var actualObj = new UnionWithoutKey(new UnionWithoutKey.Foo(new Foo { Name = "example1" }));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "bar",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithoutKey(
            new UnionWithoutKey.Bar(new Bar { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithoutKey>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "bar",
              "name": "example1"
            }
            """;
        var actualObj = new UnionWithoutKey(new UnionWithoutKey.Bar(new Bar { Name = "example1" }));
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
