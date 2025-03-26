using System.Text.Json;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Test;

[TestFixture]
public class ExceptionInfoTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var expectedObject = new ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var deserializedObject = JsonUtils.Deserialize<ExceptionInfo>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization()
    {
        var expectedJson = """
            {
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var actualObj = new ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var actualElement = JsonUtils.SerializeToElement(actualObj);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }
}
