using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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
              },
              "jsonString": "{\"foo\": \"bar\", \"baz\": \"qux\"}"
            }
            """;
        var expectedObject = new Commons.Metadata
        {
            Id = "metadata-js8dg24b",
            Data = new Dictionary<string, string>() { { "foo", "bar" }, { "baz", "qux" } },
            JsonString = "{\"foo\": \"bar\", \"baz\": \"qux\"}",
        };
        var deserializedObject = JsonUtils.Deserialize<Commons.Metadata>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "id": "metadata-js8dg24b",
              "data": {
                "foo": "bar",
                "baz": "qux"
              },
              "jsonString": "{\"foo\": \"bar\", \"baz\": \"qux\"}"
            }
            """;
        JsonAssert.Roundtrips<Commons.Metadata>(inputJson);
    }
}
