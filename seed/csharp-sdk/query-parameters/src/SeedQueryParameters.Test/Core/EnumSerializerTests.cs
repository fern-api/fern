using System;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;
using SeedQueryParameters.Core;

namespace SeedQueryParameters.Test.Core
{
    [TestFixture]
    public class StringEnumSerializerTests
    {
        private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

        private const DummyEnum KnownEnumValue2 = DummyEnum.KnownValue2;
        private const string KnownEnumValue2String = "known_value2";

        private static readonly string JsonWithKnownEnum2 = $$"""
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

    [JsonConverter(typeof(EnumSerializer<DummyEnum>))]
    public enum DummyEnum
    {
        [EnumMember(Value = "known_value1")]
        KnownValue1,

        [EnumMember(Value = "known_value2")]
        KnownValue2,
    }
}
