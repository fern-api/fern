using NUnit.Framework;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

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
                  "contents": "...",
                  "info": "REGULAR"
                }
              ],
              "directories": [
                {
                  "name": "tmp",
                  "files": [
                    {
                      "name": "another_file.txt",
                      "contents": "...",
                      "info": "REGULAR"
                    }
                  ]
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<SeedObjectsWithImports.File_.Directory>(inputJson);
    }
}
