using global::System.Text.Json;
using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class JsonTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var expectedObject = new Json
        {
            Docs = "Types extend this type to include a docs and json property.",
            Raw = "{\"docs\": true, \"json\": true}",
        };
        var deserializedObject = JsonUtils.Deserialize<Json>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        JsonAssert.Roundtrips<Json>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs and json property.",
              "raw": "{\"docs\": true, \"json\": true}"
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<Json>(json, options);
        JsonAssert.AreEqual(deserializedObject!, json);
    }
}
