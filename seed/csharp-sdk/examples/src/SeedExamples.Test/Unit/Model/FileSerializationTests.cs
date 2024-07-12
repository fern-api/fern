using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class FileSerializationTests
{
    [Test]
    public void FileSerializationTest_1()
    {
        var inputJson =
            @"
        {
  ""name"": ""file.txt"",
  ""contents"": ""...""
}
";

        var expectedObject = new File { Name = "file.txt", Contents = "..." };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<File>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }

    [Test]
    public void FileSerializationTest_2()
    {
        var inputJson =
            @"
        {
  ""name"": ""another_file.txt"",
  ""contents"": ""...""
}
";

        var expectedObject = new File { Name = "another_file.txt", Contents = "..." };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<File>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
