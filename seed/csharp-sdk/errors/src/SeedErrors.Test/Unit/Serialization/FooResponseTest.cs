using NUnit.Framework;
using SeedErrors;
using SeedErrors.Core;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooResponseTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "bar": "hello"
            }
            """;
        var expectedObject = new FooResponse { Bar = "hello" };
        var deserializedObject = JsonUtils.Deserialize<FooResponse>(json);
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
        JsonAssert.Roundtrips<FooResponse>(inputJson);
    }
}
