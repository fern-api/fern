using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExampleTypeTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        var expectedObject = new ExampleType
        {
            Docs = "This is an example type.",
            Name = "Example",
        };
        var deserializedObject = JsonUtils.Deserialize<ExampleType>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "This is an example type.",
              "name": "Example"
            }
            """;
        JsonAssert.Roundtrips<ExampleType>(inputJson);
    }
}
