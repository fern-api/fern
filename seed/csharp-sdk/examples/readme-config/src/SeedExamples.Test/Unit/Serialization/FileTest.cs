using NUnit.Framework;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

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
              "contents": "..."
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.File>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "another_file.txt",
              "contents": "..."
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.File>(inputJson);
    }
}
