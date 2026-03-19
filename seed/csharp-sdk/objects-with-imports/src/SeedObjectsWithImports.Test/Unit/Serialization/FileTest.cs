using NUnit.Framework;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FileTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        JsonAssert.Roundtrips<SeedObjectsWithImports.File>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "another_file.txt",
              "contents": "...",
              "info": "REGULAR"
            }
            """;
        JsonAssert.Roundtrips<SeedObjectsWithImports.File>(inputJson);
    }
}
