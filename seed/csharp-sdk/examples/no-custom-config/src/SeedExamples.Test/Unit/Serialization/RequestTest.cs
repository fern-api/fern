using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class RequestTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "request": {}
            }
            """;
        var expectedObject = new Request { Request_ = new Dictionary<object, object?>() { } };
        var deserializedObject = JsonUtils.Deserialize<Request>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "request": {}
            }
            """;
        JsonAssert.Roundtrips<Request>(inputJson);
    }
}
