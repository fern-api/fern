using NUnit.Framework;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DirectoryTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "root",
              "files": [
                {
                  "name": "file.txt",
                  "contents": "..."
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "..."
                    }
                  ]
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Directory>(inputJson);
    }
}
