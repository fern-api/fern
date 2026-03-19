using NUnit.Framework;
using SeedMixedCase;
using SeedMixedCase.Test.Utils;

namespace SeedMixedCase.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class OrganizationTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "orgName"
            }
            """;
        JsonAssert.Roundtrips<Organization>(inputJson);
    }
}
