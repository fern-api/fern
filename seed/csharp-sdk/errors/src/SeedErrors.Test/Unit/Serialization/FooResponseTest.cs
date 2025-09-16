using System.Text.Json;
using NUnit.Framework;
using SeedErrors;
using SeedErrors.Core;

namespace SeedErrors.Test;

[TestFixture]
public class FooResponseTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "bar": "hello"
            }
            """;
        var expectedObject = new FooResponse { Bar = "hello" };
        var deserializedObject = JsonUtils.Deserialize<FooResponse>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "bar": "hello"
            }
            """;
        var actualObj = new FooResponse { Bar = "hello" };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
