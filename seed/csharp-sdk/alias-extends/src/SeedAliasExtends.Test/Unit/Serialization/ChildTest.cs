using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Test.Utils;

namespace SeedAliasExtends.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ChildTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "parent": "Property from the parent",
              "child": "Property from the child"
            }
            """;
        JsonAssert.Roundtrips<Child>(inputJson);
    }
}
