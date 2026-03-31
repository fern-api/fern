using NUnit.Framework;
using SeedExamples.Commons;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DataTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "string",
              "value": "data"
            }
            """;
        var expectedObject = new Data(new Data.String("data"));
        var deserializedObject = JsonUtils.Deserialize<Data>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "string",
              "value": "data"
            }
            """;
        JsonAssert.Roundtrips<Data>(inputJson);
    }
}
