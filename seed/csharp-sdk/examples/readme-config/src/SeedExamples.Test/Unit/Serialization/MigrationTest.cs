using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class MigrationTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        var expectedObject = new Migration { Name = "001_init", Status = MigrationStatus.Running };
        var deserializedObject = JsonUtils.Deserialize<Migration>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "name": "001_init",
              "status": "RUNNING"
            }
            """;
        JsonAssert.Roundtrips<Migration>(inputJson);
    }
}
