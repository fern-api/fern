using System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;

namespace SeedUnions.Test;

[TestFixture]
public class UnionWithSingleElementTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithSingleElement(
            new UnionWithSingleElement.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSingleElement>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var actualObj = new UnionWithSingleElement(
            new UnionWithSingleElement.Foo(new Foo { Name = "example1" })
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
