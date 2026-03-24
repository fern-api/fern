using global::System.Text.Json;
using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;
using SeedUnknownAsAny.Test.Utils;

namespace SeedUnknownAsAny.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MyObjectTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var expectedObject = new MyObject
        {
            Unknown = new Dictionary<object, object?>()
            {
                { "boolVal", true },
                { "strVal", "string" },
            },
        };
        var deserializedObject = JsonUtils.Deserialize<MyObject>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        JsonAssert.Roundtrips<MyObject>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "unknown": {
                "boolVal": true,
                "strVal": "string"
              }
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<MyObject>(json, options);
        JsonAssert.AreEqual(deserializedObject!, json);
    }
}
