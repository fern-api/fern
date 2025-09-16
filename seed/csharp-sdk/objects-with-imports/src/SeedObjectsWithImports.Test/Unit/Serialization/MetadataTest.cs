using System.Text.Json;
using NUnit.Framework;
using SeedObjectsWithImports.Commons;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class MetadataTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var expectedObject = new Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
        };
        var deserializedObject = JsonUtils.Deserialize<Metadata>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        var actualObj = new Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
