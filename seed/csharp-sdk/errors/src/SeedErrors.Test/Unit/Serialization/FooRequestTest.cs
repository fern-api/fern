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
}
