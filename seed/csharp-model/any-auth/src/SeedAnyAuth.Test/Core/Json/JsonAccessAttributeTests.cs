using global::System.Text.Json.Serialization;
using NUnit.Framework;
using SeedAnyAuth.Core;

namespace SeedAnyAuth.Test.Core.Json;

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
    }

    [Test]
    public void JsonAccessAttribute_ShouldWorkAsExpected()
    {
        const string json =
            """ { "read_only_prop": "read", "write_only_prop": "write", "normal_prop": "normal_prop" } """;
        var obj = JsonUtils.Deserialize<MyClass>(json);

        Assert.Multiple(() =>
        {
            Assert.That(obj.ReadOnlyProp, Is.EqualTo("read"));
            Assert.That(obj.WriteOnlyProp, Is.Null);
            Assert.That(obj.NormalProp, Is.EqualTo("normal_prop"));
        });

        obj.WriteOnlyProp = "write";
        obj.NormalProp = "new_value";

        var serializedJson = JsonUtils.Serialize(obj);
        const string expectedJson =
            "{\n  \"write_only_prop\": \"write\",\n  \"normal_prop\": \"new_value\"\n}";
        Assert.That(serializedJson, Is.EqualTo(expectedJson));
    }
}
