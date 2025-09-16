using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithDuplicateTypesTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "foo1",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo1(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicateTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var expectedJson = """
            {
              "type": "foo1",
              "name": "example1"
            }
            """;
        var actualObj = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo1(new Foo { Name = "example1" })
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
              "type": "foo2",
              "name": "example2"
            }
            """;
        var expectedObject = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo2(new Foo { Name = "example2" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicateTypes>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var expectedJson = """
            {
              "type": "foo2",
              "name": "example2"
            }
            """;
        var actualObj = new UnionWithDuplicateTypes(
            new UnionWithDuplicateTypes.Foo2(new Foo { Name = "example2" })
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
