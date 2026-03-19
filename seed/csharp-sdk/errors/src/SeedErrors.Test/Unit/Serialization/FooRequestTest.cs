using NUnit.Framework;
using SeedErrors;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooRequestTest
{
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
