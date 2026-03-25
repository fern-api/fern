using global::System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ActressTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var expectedObject = new Actress { Name = "Jennifer Lawrence", Id = "actor_456" };
        var deserializedObject = JsonUtils.Deserialize<Actress>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        JsonAssert.Roundtrips<Actress>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding()
    {
        var json = """
            {
              "name": "Jennifer Lawrence",
              "id": "actor_456"
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<Actress>(json, options);
        JsonAssert.AreEqual(deserializedObject!, json, options);
    }
}
