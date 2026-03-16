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
                        public class InlineEnum1;
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
