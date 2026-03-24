using global::System.Text.Json;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExampleTypeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var expectedObject = new ExampleType
        {
            Docs = "This is an example type.",
            Name = "Example",
        };
        var deserializedObject = JsonUtils.Deserialize<ExampleType>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        JsonAssert.Roundtrips<ExampleType>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var expectedObject = new ExampleType
        {
            Docs = "This is an example type.",
            Name = "Example",
        };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<ExampleType>(json, options);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}
