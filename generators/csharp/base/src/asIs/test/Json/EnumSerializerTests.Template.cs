using global::System.Runtime.Serialization;
using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using NUnit.Framework;
using <%= namespace%>.Core;

namespace <%= testNamespace%>.Core.Json;

[TestFixture]
[Parallelizable(ParallelScope.All)]
public class StringEnumSerializerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    private const DummyEnum KnownEnumValue2 = DummyEnum.KnownValue2;
    private const string KnownEnumValue2String = "known_value2";

    private const string JsonWithKnownEnum2 = $$"""
                                                {
                                                    "enum_property": "{{KnownEnumValue2String}}"
                                                }
                                                """;

    [Test]
    public void ShouldParseKnownEnumValue2()
    {
        var obj = JsonSerializer.Deserialize<DummyObject>(JsonWithKnownEnum2, JsonOptions);
        Assert.That(obj, Is.Not.Null);
        Assert.That(obj.EnumProperty, Is.EqualTo(KnownEnumValue2));
    }

    [Test]
    public void ShouldSerializeKnownEnumValue2()
    {
        var json = JsonSerializer.SerializeToElement(
            new DummyObject { EnumProperty = KnownEnumValue2 },
            JsonOptions
        );
        TestContext.Out.WriteLine("Serialized JSON: \n" + json);
        var enumString = json.GetProperty("enum_property").GetString();
        Assert.That(enumString, Is.Not.Null);
        Assert.That(enumString, Is.EqualTo(KnownEnumValue2String));
    }
}

public class DummyObject
{
    [JsonPropertyName("enum_property")]
    public DummyEnum EnumProperty { get; set; }
}

[JsonConverter(typeof(DummyEnumSerializer))]
public enum DummyEnum
{
    [EnumMember(Value = "known_value1")]
    KnownValue1,

    [EnumMember(Value = "known_value2")]
    KnownValue2
}

internal class DummyEnumSerializer : JsonConverter<DummyEnum>
{
    private static readonly Dictionary<string, DummyEnum> _stringToEnum = new()
    {
        { "known_value1", DummyEnum.KnownValue1 },
        { "known_value2", DummyEnum.KnownValue2 },
    };

    private static readonly Dictionary<DummyEnum, string> _enumToString = new()
    {
        { DummyEnum.KnownValue1, "known_value1" },
        { DummyEnum.KnownValue2, "known_value2" },
    };

    public override DummyEnum Read(ref System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options)
    {
        var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, DummyEnum value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : null);
    }
}
