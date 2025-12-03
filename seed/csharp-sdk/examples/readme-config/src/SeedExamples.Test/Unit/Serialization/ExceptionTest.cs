using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test_;

[TestFixture]
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
        var expectedJson = """
            {
              "type": "generic",
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var actualObj = new SeedExamples.Exception(
            new SeedExamples.Exception.Generic(
                new ExceptionInfo
                {
                    ExceptionType = "Unavailable",
                    ExceptionMessage = "This component is unavailable!",
                    ExceptionStacktrace = "<logs>",
                }
            )
        );
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
