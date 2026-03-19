using NUnit.Framework;
using SeedExamples;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class NodeTest
{
    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "name": "root",
              "nodes": [
                {
                  "name": "left"
                },
                {
                  "name": "right"
                }
              ],
              "trees": [
                {
                  "nodes": [
                    {
                      "name": "left"
                    },
                    {
                      "name": "right"
                    }
                  ]
                }
              ]
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "name": "left"
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "name": "right"
            }
            """;
        JsonAssert.Roundtrips<Node>(inputJson);
    }
}
