using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UserTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "userName": "username",
              "metadata_tags": [
                "tag1",
                "tag2"
              ],
              "EXTRA_PROPERTIES": {
                "foo": "bar",
                "baz": "qux"
              }
            }
            """;
        JsonAssert.Roundtrips<User>(inputJson);
    }
}
