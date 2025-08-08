using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class ExceptionTest
{
    [Test]
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
                new SeedExamples.ExceptionInfo
                {
                    ExceptionType = "Unavailable",
                    ExceptionMessage = "This component is unavailable!",
                    ExceptionStacktrace = "<logs>",
                }
            )
        );
        var deserializedObject = SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Exception>(
            json
        );
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
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
                new SeedExamples.ExceptionInfo
                {
                    ExceptionType = "Unavailable",
                    ExceptionMessage = "This component is unavailable!",
                    ExceptionStacktrace = "<logs>",
                }
            )
        );
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
