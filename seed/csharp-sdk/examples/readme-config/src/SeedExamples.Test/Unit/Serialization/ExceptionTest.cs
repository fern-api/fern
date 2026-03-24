using global::System.Text.Json;
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

    [NUnit.Framework.Test]
    public void TestModelBinding()
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
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<SeedExamples.Exception>(json, options);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }
}
