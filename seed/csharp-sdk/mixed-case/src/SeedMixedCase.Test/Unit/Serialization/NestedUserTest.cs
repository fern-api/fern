using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NestedUserTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "Name": "username",
              "NestedUser": {
                "userName": "nestedUsername",
                "metadata_tags": [
                  "tag1",
                  "tag2"
                ],
                "EXTRA_PROPERTIES": {
                  "foo": "bar",
                  "baz": "qux"
                }
              }
            }
            """;
        JsonAssert.Roundtrips<NestedUser>(inputJson);
    }
}
