using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// lorem ipsum
/// </summary>
[Serializable]
public record RootType1 : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("bar")]
    public required Types.RootType1InlineType1 Bar { get; set; }

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooMap")]
    public Dictionary<string, Types.RootType1FooMapValue> FooMap { get; set; } =
        new Dictionary<string, Types.RootType1FooMapValue>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooList")]
    public IEnumerable<Types.RootType1FooListItem> FooList { get; set; } =
        new List<Types.RootType1FooListItem>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("fooSet")]
    public HashSet<Types.RootType1FooSetItem> FooSet { get; set; } =
        new HashSet<Types.RootType1FooSetItem>();

    /// <summary>
    /// lorem ipsum
    /// </summary>
    [JsonPropertyName("ref")]
    public required ReferenceType Ref { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    public static class Types
    {
        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record RootType1InlineType1 : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("bar")]
            public required Types.RootType1InlineType1NestedInlineType1 Bar { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }

            public static class Types
            {
                /// <summary>
                /// lorem ipsum
                /// </summary>
                [Serializable]
                public record RootType1InlineType1NestedInlineType1 : IJsonOnDeserialized
                {
                    [JsonExtensionData]
                    private readonly IDictionary<string, JsonElement> _extensionData =
                        new Dictionary<string, JsonElement>();

                    /// <summary>
                    /// lorem ipsum
                    /// </summary>
                    [JsonPropertyName("foo")]
                    public required string Foo { get; set; }

                    /// <summary>
                    /// lorem ipsum
                    /// </summary>
                    [JsonPropertyName("bar")]
                    public required string Bar { get; set; }

                    /// <summary>
                    /// lorem ipsum
                    /// </summary>
                    [JsonPropertyName("myEnum")]
                    public required Types.InlineEnum1 MyEnum { get; set; }

                    /// <summary>
                    /// lorem ipsum
                    /// </summary>
                    [JsonPropertyName("ref")]
                    public required ReferenceType Ref { get; set; }

                    [JsonIgnore]
                    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
                        new();

                    void IJsonOnDeserialized.OnDeserialized() =>
                        AdditionalProperties.CopyFromExtensionData(_extensionData);

                    /// <inheritdoc />
                    public override string ToString()
                    {
                        return JsonUtils.Serialize(this);
                    }

                    public static class Types
                    {
                        [JsonConverter(typeof(Types.InlineEnum1.InlineEnum1Serializer))]
                        [Serializable]
                        public readonly record struct InlineEnum1 : IStringEnum
                        {
                            public static readonly Types.InlineEnum1 Sunny = new(Values.Sunny);

                            public static readonly Types.InlineEnum1 Cloudy = new(Values.Cloudy);

                            public static readonly Types.InlineEnum1 Raining = new(Values.Raining);

                            public static readonly Types.InlineEnum1 Snowing = new(Values.Snowing);

                            public InlineEnum1(string value)
                            {
                                Value = value;
                            }

                            /// <summary>
                            /// The string value of the enum.
                            /// </summary>
                            public string Value { get; }

                            /// <summary>
                            /// Create a string enum with the given value.
                            /// </summary>
                            public static Types.InlineEnum1 FromCustom(string value)
                            {
                                return new Types.InlineEnum1(value);
                            }

                            public bool Equals(string? other)
                            {
                                return Value.Equals(other);
                            }

                            /// <summary>
                            /// Returns the string value of the enum.
                            /// </summary>
                            public override string ToString()
                            {
                                return Value;
                            }

                            public static bool operator ==(
                                Types.InlineEnum1 value1,
                                string value2
                            ) => value1.Value.Equals(value2);

                            public static bool operator !=(
                                Types.InlineEnum1 value1,
                                string value2
                            ) => !value1.Value.Equals(value2);

                            public static explicit operator string(Types.InlineEnum1 value) =>
                                value.Value;

                            public static explicit operator Types.InlineEnum1(string value) =>
                                new(value);

                            internal class InlineEnum1Serializer : JsonConverter<InlineEnum1>
                            {
                                public override Types.InlineEnum1 Read(
                                    ref Utf8JsonReader reader,
                                    Type typeToConvert,
                                    JsonSerializerOptions options
                                )
                                {
                                    var stringValue =
                                        reader.GetString()
                                        ?? throw new global::System.Exception(
                                            "The JSON value could not be read as a string."
                                        );
                                    return new InlineEnum1(stringValue);
                                }

                                public override void Write(
                                    Utf8JsonWriter writer,
                                    Types.InlineEnum1 value,
                                    JsonSerializerOptions options
                                )
                                {
                                    writer.WriteStringValue(value.Value);
                                }
                            }

                            /// <summary>
                            /// Constant strings for enum values
                            /// </summary>
                            [Serializable]
                            public static class Values
                            {
                                public const string Sunny = "SUNNY";

                                public const string Cloudy = "CLOUDY";

                                public const string Raining = "RAINING";

                                public const string Snowing = "SNOWING";
                            }
                        }
                    }
                }
            }
        }

        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record RootType1FooMapValue : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }

        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record RootType1FooListItem : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }

        /// <summary>
        /// lorem ipsum
        /// </summary>
        [Serializable]
        public record RootType1FooSetItem : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

            /// <summary>
            /// lorem ipsum
            /// </summary>
            [JsonPropertyName("ref")]
            public required ReferenceType Ref { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }
    }
}
