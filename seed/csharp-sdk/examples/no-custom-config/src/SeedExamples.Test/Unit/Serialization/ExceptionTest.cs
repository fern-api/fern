using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;
using SeedExamples.Test_.Utils;

namespace SeedExamples.Test_;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExceptionTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "type": "generic",
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var expectedObject = new SeedExamples.Exception(
            new SeedExamples.Exception.Generic(
                new ExceptionInfo
                {
                    ExceptionType = "Unavailable",
                    ExceptionMessage = "This component is unavailable!",
                    ExceptionStacktrace = "<logs>",
                }
            )
        );
        var deserializedObject = JsonUtils.Deserialize<SeedExamples.Exception>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var inputJson = """
            {
              "type": "generic",
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        JsonAssert.Roundtrips<SeedExamples.Exception>(inputJson);
    }
}
