using global::System.Text.Json.Serialization;
using NUnit.Framework;
using SeedHeaderToken.Core;

namespace SeedHeaderToken.Test.Core.Json;

[TestFixture]
public class JsonAccessAttributeTests
{
    private class MyClass
    {
        [JsonPropertyName("read_only_prop")]
        [JsonAccess(JsonAccessType.ReadOnly)]
        public string? ReadOnlyProp { get; set; }

        [JsonPropertyName("write_only_prop")]
        [JsonAccess(JsonAccessType.WriteOnly)]
        public string? WriteOnlyProp { get; set; }

        [JsonPropertyName("normal_prop")]
        public string? NormalProp { get; set; }

        [JsonPropertyName("read_only_nullable_list")]
        [JsonAccess(JsonAccessType.ReadOnly)]
        public IEnumerable<string>? ReadOnlyNullableList { get; set; }

        [JsonPropertyName("read_only_list")]
        [JsonAccess(JsonAccessType.ReadOnly)]
        public IEnumerable<string> ReadOnlyList { get; set; } = [];

        [JsonPropertyName("write_only_nullable_list")]
        [JsonAccess(JsonAccessType.WriteOnly)]
        public IEnumerable<string>? WriteOnlyNullableList { get; set; }

        [JsonPropertyName("write_only_list")]
        [JsonAccess(JsonAccessType.WriteOnly)]
        public IEnumerable<string> WriteOnlyList { get; set; } = [];

        [JsonPropertyName("normal_list")]
        public IEnumerable<string> NormalList { get; set; } = [];

        [JsonPropertyName("normal_nullable_list")]
        public IEnumerable<string>? NullableNormalList { get; set; }
    }

    [Test]
    public void JsonAccessAttribute_ShouldWorkAsExpected()
    {
        const string json = """
            {
                "read_only_prop": "read",
                "write_only_prop": "write",
                "normal_prop": "normal_prop",
                "read_only_nullable_list": ["item1", "item2"],
                "read_only_list": ["item3", "item4"],
                "write_only_nullable_list": ["item5", "item6"],
                "write_only_list": ["item7", "item8"],
                "normal_list": ["normal1", "normal2"],
                "normal_nullable_list": ["normal1", "normal2"]
            }
            """;
        var obj = JsonUtils.Deserialize<MyClass>(json);

        Assert.Multiple(() =>
        {
            // String properties
            Assert.That(obj.ReadOnlyProp, Is.EqualTo("read"));
            Assert.That(obj.WriteOnlyProp, Is.Null);
            Assert.That(obj.NormalProp, Is.EqualTo("normal_prop"));

            // List properties - read only
            var nullableReadOnlyList = obj.ReadOnlyNullableList?.ToArray();
            Assert.That(nullableReadOnlyList, Is.Not.Null);
            Assert.That(nullableReadOnlyList, Has.Length.EqualTo(2));
            Assert.That(nullableReadOnlyList![0], Is.EqualTo("item1"));
            Assert.That(nullableReadOnlyList![1], Is.EqualTo("item2"));

            var readOnlyList = obj.ReadOnlyList.ToArray();
            Assert.That(readOnlyList, Is.Not.Null);
            Assert.That(readOnlyList, Has.Length.EqualTo(2));
            Assert.That(readOnlyList[0], Is.EqualTo("item3"));
            Assert.That(readOnlyList[1], Is.EqualTo("item4"));

            // List properties - write only
            Assert.That(obj.WriteOnlyNullableList, Is.Null);
            Assert.That(obj.WriteOnlyList, Is.Not.Null);
            Assert.That(obj.WriteOnlyList, Is.Empty);

            // Normal list property
            var normalList = obj.NormalList.ToArray();
            Assert.That(normalList, Is.Not.Null);
            Assert.That(normalList, Has.Length.EqualTo(2));
            Assert.That(normalList[0], Is.EqualTo("normal1"));
            Assert.That(normalList[1], Is.EqualTo("normal2"));
        });

        // Set up values for serialization
        obj.WriteOnlyProp = "write";
        obj.NormalProp = "new_value";
        obj.WriteOnlyNullableList = new List<string> { "write1", "write2" };
        obj.WriteOnlyList = new List<string> { "write3", "write4" };
        obj.NormalList = new List<string> { "new_normal" };
        obj.NullableNormalList = new List<string> { "new_normal" };

        var serializedJson = JsonUtils.Serialize(obj);
        const string expectedJson = """
            {
              "write_only_prop": "write",
              "normal_prop": "new_value",
              "write_only_nullable_list": [
                "write1",
                "write2"
              ],
              "write_only_list": [
                "write3",
                "write4"
              ],
              "normal_list": [
                "new_normal"
              ],
              "normal_nullable_list": [
                "new_normal"
              ]
            }
            """;
        Assert.That(serializedJson, Is.EqualTo(expectedJson).IgnoreWhiteSpace);
    }

    [Test]
    public void JsonAccessAttribute_WithNullListsInJson_ShouldWorkAsExpected()
    {
        const string json = """
            {
                "read_only_prop": "read",
                "normal_prop": "normal_prop",
                "read_only_nullable_list": null,
                "read_only_list": []
            }
            """;
        var obj = JsonUtils.Deserialize<MyClass>(json);

        Assert.Multiple(() =>
        {
            // Read-only nullable list should be null when JSON contains null
            var nullableReadOnlyList = obj.ReadOnlyNullableList?.ToArray();
            Assert.That(nullableReadOnlyList, Is.Null);

            // Read-only non-nullable list should never be null, but empty when JSON contains null
            var readOnlyList = obj.ReadOnlyList.ToArray(); // This should be initialized to an empty list by default
            Assert.That(readOnlyList, Is.Not.Null);
            Assert.That(readOnlyList, Is.Empty);
        });

        // Serialize and verify read-only lists are not included
        var serializedJson = JsonUtils.Serialize(obj);
        Assert.That(serializedJson, Does.Not.Contain("read_only_prop"));
        Assert.That(serializedJson, Does.Not.Contain("read_only_nullable_list"));
        Assert.That(serializedJson, Does.Not.Contain("read_only_list"));
    }
}
