using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedExamples;
using SeedExamples.Core;

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
        var expectedObject = new ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var deserializedObject = JsonUtils.Deserialize<ExceptionInfo>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "exceptionType": "Unavailable",
              "exceptionMessage": "This component is unavailable!",
              "exceptionStacktrace": "<logs>"
            }
            """;
        var obj = new ExceptionInfo
        {
            ExceptionType = "Unavailable",
            ExceptionMessage = "This component is unavailable!",
            ExceptionStacktrace = "<logs>",
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
