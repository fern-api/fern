using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;
using SeedEnum.Core;

namespace SeedEnum.Test.Core
{
    [TestFixture]
    public class StringEnumSerializerTests
    {
        private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

        private static readonly DummyEnum KnownEnumValue2 = DummyEnum.KnownValue2;
        private static readonly DummyEnum UnknownEnumValue = DummyEnum.Custom("unknown_value");

        private static readonly string JsonWithKnownEnum2 = $$"""
            {
                "enum_property": "{{KnownEnumValue2}}"
            }
            """;

        private static readonly string JsonWithUnknownEnum = $$"""
            {
                "enum_property": "{{UnknownEnumValue}}"
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
        public void ShouldParseUnknownEnum()
        {
            var obj = JsonSerializer.Deserialize<DummyObject>(JsonWithUnknownEnum, JsonOptions);
            Assert.That(obj, Is.Not.Null);
            Assert.That(obj.EnumProperty, Is.EqualTo(UnknownEnumValue));
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
            Assert.That(enumString, Is.EqualTo(KnownEnumValue2));
        }

        [Test]
        public void ShouldSerializeUnknownEnum()
        {
            var json = JsonSerializer.SerializeToElement(
                new DummyObject { EnumProperty = UnknownEnumValue },
                JsonOptions
            );
            TestContext.Out.WriteLine("Serialized JSON: \n" + json);
            var enumString = json.GetProperty("enum_property").GetString();
            Assert.That(enumString, Is.Not.Null);
            Assert.That(enumString, Is.EqualTo(UnknownEnumValue));
        }
    }

    public class DummyObject
    {
        [JsonPropertyName("enum_property")]
        public DummyEnum EnumProperty { get; set; }
    }

    [JsonConverter(typeof(StringEnumSerializer<DummyEnum>))]
    public readonly record struct DummyEnum : IStringEnum
    {
        public DummyEnum(string value)
        {
            Value = value;
        }

        /// <summary>
        /// The string value of the enum.
        /// </summary>
        public string Value { get; }

        public static readonly DummyEnum KnownValue1 = Custom(Values.KnownValue1);

        public static readonly DummyEnum KnownValue2 = Custom(Values.KnownValue2);

        /// <summary>
        /// Constant strings for enum values
        /// </summary>
        public static class Values
        {
            public const string KnownValue1 = "known_value1";

            public const string KnownValue2 = "known_value2";
        }

        /// <summary>
        /// Create a string enum with the given value.
        /// </summary>
        public static DummyEnum Custom(string value)
        {
            return new DummyEnum(value);
        }

        /// <summary>
        /// Returns the string value of the enum.
        /// </summary>
        public override string ToString()
        {
            return Value;
        }

        public bool Equals(string? other)
        {
            return Value.Equals(other);
        }

        public override int GetHashCode()
        {
            return Value.GetHashCode();
        }

        public static bool operator ==(DummyEnum value1, string value2) =>
            value1.Value.Equals(value2);

        public static bool operator !=(DummyEnum value1, string value2) =>
            !value1.Value.Equals(value2);
    }
}
