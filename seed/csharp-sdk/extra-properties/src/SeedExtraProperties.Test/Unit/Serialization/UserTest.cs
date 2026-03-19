using NUnit.Framework;
using SeedExtraProperties;
using SeedExtraProperties.Test.Utils;

namespace SeedExtraProperties.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UserTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "Alice",
              "age": 30,
              "location": "Wonderland"
            }
            """;
        JsonAssert.Roundtrips<User>(inputJson);
    }
}
