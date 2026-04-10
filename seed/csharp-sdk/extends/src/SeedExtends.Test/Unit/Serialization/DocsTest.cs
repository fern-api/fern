using NUnit.Framework;
using SeedExtends;
using SeedExtends.Core;
using SeedExtends.Test.Utils;

namespace SeedExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DocsTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        var expectedObject = new Docs
        {
            Docs_ = "Types extend this type to include a docs property.",
        };
        var deserializedObject = JsonUtils.Deserialize<Docs>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "docs": "Types extend this type to include a docs property."
            }
            """;
        JsonAssert.Roundtrips<Docs>(inputJson);
    }
}
