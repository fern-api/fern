using System.Text.Json;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObject;

#nullable enable

namespace SeedObject.Test;

[TestFixture]
public class TypeSerializationTests
{
    [Test]
    public void TypeSerializationTest()
    {
        var inputJson =
            @"
        {
  ""one"": 1,
  ""two"": 2,
  ""three"": ""three"",
  ""four"": true,
  ""five"": 5,
  ""six"": ""1994-01-01T01:01:01Z"",
  ""seven"": ""1994-01-01"",
  ""eight"": ""7f71f677-e138-4a5c-bb01-e4453a19bfef"",
  ""nine"": ""TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"",
  ""ten"": [
    10,
    10
  ],
  ""eleven"": [
    11
  ],
  ""twelve"": {
    ""invalid"": false,
    ""exists"": true
  },
  ""thirteen"": 13,
  ""fourteen"": {},
  ""fifteen"": [
    [
      15,
      15
    ],
    [
      15,
      15
    ]
  ],
  ""sixteen"": [
    {
      ""foo"": 16,
      ""bar"": 16
    }
  ],
  ""seventeen"": [
    ""244c6643-f99d-4bfc-b20d-a6518f3a4cf4"",
    ""07791987-dec3-43b5-8dc4-250ab5dc0478""
  ],
  ""eighteen"": ""eighteen"",
  ""nineteen"": {
    ""id"": ""name-129fsdj9"",
    ""value"": ""nineteen""
  }
}
";

        var expectedObject = new Type
        {
            One = 1,
            Two = 2,
            Three = "three",
            Four = true,
            Five = 5,
            Six = new DateTime(1993, 12, 31, 20, 01, 01, 000),
            Seven = new DateOnly(1993, 12, 31),
            Eight = new Guid("7f71f677-e138-4a5c-bb01-e4453a19bfef"),
            Nine = "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu",
            Ten = new List<int>() { 10, 10 },
            Eleven = new HashSet<double>() { 11 },
            Twelve = new Dictionary<string, bool>() { { "invalid", false }, { "exists", true }, },
            Thirteen = 13,
            Fourteen = "--unknown--",
            Fifteen = new List<IEnumerable<int>>()
            {
                new List<int>() { 15, 15 },
                new List<int>() { 15, 15 }
            },
            Sixteen = new List<Dictionary<string, int>>()
            {
                new Dictionary<string, int>() { { "foo", 16 }, { "bar", 16 }, }
            },
            Seventeen = new List<Guid>()
            {
                new Guid("244c6643-f99d-4bfc-b20d-a6518f3a4cf4"),
                new Guid("07791987-dec3-43b5-8dc4-250ab5dc0478")
            },
            Eighteen = "eighteen",
            Nineteen = new Name { Id = "name-129fsdj9", Value = "nineteen" }
        };

        var serializerOptions = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var deserializedObject = JsonSerializer.Deserialize<Type>(inputJson, serializerOptions);
        Assert.That(expectedObject, Is.EqualTo(deserializedObject));

        var serializedJson = JsonSerializer.Serialize(deserializedObject, serializerOptions);
        Assert.That(JToken.DeepEquals(JToken.Parse(inputJson), JToken.Parse(serializedJson)));
    }
}
