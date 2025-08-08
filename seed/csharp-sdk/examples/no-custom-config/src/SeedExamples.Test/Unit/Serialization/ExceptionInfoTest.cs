using System.Text.Json;
using NUnit.Framework;

namespace SeedExamples.Test;

[TestFixture]
public class ExceptionInfoTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var expectedObject = new SeedExamples.ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var deserializedObject =
            SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.ExceptionInfo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var actualObj = new SeedExamples.ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var actualElement = SeedExamples.Core.JsonUtils.SerializeToElement(actualObj);
        var expectedElement = SeedExamples.Core.JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
