using global::System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EntityTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var expectedObject = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var deserializedObject = JsonUtils.Deserialize<Entity>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        JsonAssert.Roundtrips<Entity>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "type": "unknown",
              "name": "unknown"
            }
            """;
        var expectedObject = new Entity { Type = ComplexType.Unknown, Name = "unknown" };
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<Entity>(json, options);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}
