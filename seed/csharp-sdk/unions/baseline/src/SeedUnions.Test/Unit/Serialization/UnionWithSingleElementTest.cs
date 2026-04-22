using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithSingleElementTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        var expectedObject = new UnionWithSingleElement(
            new UnionWithSingleElement.Foo(new Foo { Name = "example1" })
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithSingleElement>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "foo",
              "name": "example1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithSingleElement>(inputJson);
    }
}
