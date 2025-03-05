using System.Globalization;
using System.Text.Json.Nodes;
using NUnit.Framework;
using SeedObject;
using SeedObject.Core;

namespace SeedObject.Test;

[TestFixture]
public class TypeTest
{
    [Test]
    public void TestDeserialization()
    {
        var json = """
            {
              "one": 1,
              "two": 2,
              "three": "three",
              "four": true,
              "five": 5,
              "six": "1994-01-01T01:01:01Z",
              "seven": "1994-01-01",
              "eight": "7f71f677-e138-4a5c-bb01-e4453a19bfef",
              "nine": "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu",
              "ten": [
                10,
                10
              ],
              "eleven": [
                11
              ],
              "twelve": {
                "invalid": false,
                "exists": true
              },
              "thirteen": 13,
              "fourteen": {},
              "fifteen": [
                [
                  15,
                  15
                ],
                [
                  15,
                  15
                ]
              ],
              "sixteen": [
                {
                  "foo": 16,
                  "bar": 16
                }
              ],
              "seventeen": [
                "244c6643-f99d-4bfc-b20d-a6518f3a4cf4",
                "07791987-dec3-43b5-8dc4-250ab5dc0478"
              ],
              "eighteen": "eighteen",
              "nineteen": {
                "id": "name-129fsdj9",
                "value": "nineteen"
              },
              "twenty": 20,
              "twentyone": 21,
              "twentytwo": 22.22,
              "twentythree": "23",
              "twentyfour": "1994-01-01T01:01:01Z",
              "twentyfive": "1994-01-01"
            }
            """;
        var expectedObject = new Type
        {
            One = 1,
            Two = 2,
            Three = "three",
            Four = true,
            Five = 5,
            Six = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
            Seven = new DateOnly(1994, 1, 1),
            Eight = "7f71f677-e138-4a5c-bb01-e4453a19bfef",
            Nine = "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu",
            Ten = new List<int>() { 10, 10 },
            Eleven = new HashSet<double>() { 11 },
            Twelve = new Dictionary<string, bool>() { { "invalid", false }, { "exists", true } },
            Thirteen = 13,
            Fourteen = new Dictionary<object, object?>() { },
            Fifteen = new List<IEnumerable<int>>()
            {
                new List<int>() { 15, 15 },
                new List<int>() { 15, 15 },
            },
            Sixteen = new List<Dictionary<string, int>>()
            {
                new Dictionary<string, int>() { { "foo", 16 }, { "bar", 16 } },
            },
            Seventeen = new List<string>()
            {
                "244c6643-f99d-4bfc-b20d-a6518f3a4cf4",
                "07791987-dec3-43b5-8dc4-250ab5dc0478",
            },
            Eighteen = "eighteen",
            Nineteen = new Name { Id = "name-129fsdj9", Value = "nineteen" },
            Twenty = 20,
            Twentyone = 21,
            Twentytwo = 22.22f,
            Twentythree = "23",
            Twentyfour = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
            Twentyfive = new DateOnly(1994, 1, 1),
        };
        var deserializedObject = JsonUtils.Deserialize<Type>(json);
        var serializedJson = JsonUtils.Serialize(deserializedObject);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingPropertiesComparer());
    }

    [Test]
    public void TestSerialization()
    {
        var json = """
            {
              "one": 1,
              "two": 2,
              "three": "three",
              "four": true,
              "five": 5,
              "six": "1994-01-01T01:01:01Z",
              "seven": "1994-01-01",
              "eight": "7f71f677-e138-4a5c-bb01-e4453a19bfef",
              "nine": "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu",
              "ten": [
                10,
                10
              ],
              "eleven": [
                11
              ],
              "twelve": {
                "invalid": false,
                "exists": true
              },
              "thirteen": 13,
              "fourteen": {},
              "fifteen": [
                [
                  15,
                  15
                ],
                [
                  15,
                  15
                ]
              ],
              "sixteen": [
                {
                  "foo": 16,
                  "bar": 16
                }
              ],
              "seventeen": [
                "244c6643-f99d-4bfc-b20d-a6518f3a4cf4",
                "07791987-dec3-43b5-8dc4-250ab5dc0478"
              ],
              "eighteen": "eighteen",
              "nineteen": {
                "id": "name-129fsdj9",
                "value": "nineteen"
              },
              "twenty": 20,
              "twentyone": 21,
              "twentytwo": 22.22,
              "twentythree": "23",
              "twentyfour": "1994-01-01T01:01:01Z",
              "twentyfive": "1994-01-01"
            }
            """;
        var obj = new Type
        {
            One = 1,
            Two = 2,
            Three = "three",
            Four = true,
            Five = 5,
            Six = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
            Seven = new DateOnly(1994, 1, 1),
            Eight = "7f71f677-e138-4a5c-bb01-e4453a19bfef",
            Nine = "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu",
            Ten = new List<int>() { 10, 10 },
            Eleven = new HashSet<double>() { 11 },
            Twelve = new Dictionary<string, bool>() { { "invalid", false }, { "exists", true } },
            Thirteen = 13,
            Fourteen = new Dictionary<object, object?>() { },
            Fifteen = new List<IEnumerable<int>>()
            {
                new List<int>() { 15, 15 },
                new List<int>() { 15, 15 },
            },
            Sixteen = new List<Dictionary<string, int>>()
            {
                new Dictionary<string, int>() { { "foo", 16 }, { "bar", 16 } },
            },
            Seventeen = new List<string>()
            {
                "244c6643-f99d-4bfc-b20d-a6518f3a4cf4",
                "07791987-dec3-43b5-8dc4-250ab5dc0478",
            },
            Eighteen = "eighteen",
            Nineteen = new Name { Id = "name-129fsdj9", Value = "nineteen" },
            Twenty = 20,
            Twentyone = 21,
            Twentytwo = 22.22f,
            Twentythree = "23",
            Twentyfour = DateTime.Parse(
                "1994-01-01T01:01:01.000Z",
                null,
                DateTimeStyles.AdjustToUniversal
            ),
            Twentyfive = new DateOnly(1994, 1, 1),
        };
        var objAsNode = JsonUtils.SerializeToNode(obj);
        var jsonAsNode = JsonUtils.Deserialize<JsonNode>(json);
        Assert.That(objAsNode, Is.EqualTo(jsonAsNode).UsingPropertiesComparer());
    }
}
