using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TreeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "nodes": [
                {
                  "id": "node-8dvgfja2",
                  "label": "left",
                  "metadata": {
                    "id": "metadata-kjasf923",
                    "data": {
                      "foo": "bar",
                      "baz": "qux"
                    }
                  }
                },
                {
                  "id": "node-cwda9fi2x",
                  "label": "right",
                  "metadata": {
                    "id": "metadata-lkasdfv9j",
                    "data": {
                      "one": "two",
                      "three": "four"
                    }
                  }
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<Tree>(inputJson);
    }
}
