using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithSubTypesTest
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
        var expectedObject = new UnionWithSubTypes(
            new UnionWithSubTypes.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSubTypes>(json);
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
        var actualObj = new UnionWithSubTypes(
            new UnionWithSubTypes.Foo(new Foo { Name = "example1" })
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
              "type": "fooExtended",
              "name": "example2",
              "age": 5
            }
            """;
        var expectedObject = new UnionWithSubTypes(
            new UnionWithSubTypes.FooExtended(new FooExtended { Name = "example2", Age = 5 })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSubTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "fooExtended",
              "name": "example2",
              "age": 5
            }
            """;
        var actualObj = new UnionWithSubTypes(
            new UnionWithSubTypes.FooExtended(new FooExtended { Name = "example2", Age = 5 })
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
