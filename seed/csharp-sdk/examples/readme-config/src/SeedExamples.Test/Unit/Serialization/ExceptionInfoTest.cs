using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

namespace SeedExamples.Test;

[TestFixture]
public class ExceptionInfoTest
{
    [Test]
    public void TestSerialization()
    {
        var inputJson =
            @"
        {
          ""exceptionType"": ""Unavailable"",
          ""exceptionMessage"": ""This component is unavailable!"",
          ""exceptionStacktrace"": ""<logs>""
        }
        ";

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var deserializedObject = JsonSerializer.Deserialize<ExceptionInfo>(
            inputJson,
            serializerOptions
        );

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);

        JToken.Parse(inputJson).Should().BeEquivalentTo(JToken.Parse(serializedJson));
    }
}
