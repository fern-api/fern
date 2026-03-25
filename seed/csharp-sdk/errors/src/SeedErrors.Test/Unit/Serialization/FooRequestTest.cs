using global::System.Text.Json;
using NUnit.Framework;
using SeedErrors;
using SeedErrors.Core;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooRequestTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "bar": "hello"
            }
            """;
        var expectedObject = new FooRequest { Bar = "hello" };
        var deserializedObject = JsonUtils.Deserialize<FooRequest>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "bar": "hello"
            }
            """;
        JsonAssert.Roundtrips<FooRequest>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "bar": "hello"
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<FooRequest>(json, options);
        JsonAssert.AreEqual(deserializedObject!, json, options);
    }
}
