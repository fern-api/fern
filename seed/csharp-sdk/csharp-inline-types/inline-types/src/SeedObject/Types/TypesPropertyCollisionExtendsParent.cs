using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record TypesPropertyCollisionExtendsParent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// This inline child should be nested inside InnerTypes since "Types" is inherited
    /// </summary>
    [JsonPropertyName("child")]
    public required InnerTypes.TypesPropertyCollisionExtendsChild Child { get; set; }

    /// <summary>
    /// This inherited property collides with the default nested class name "Types"
    /// </summary>
    [JsonPropertyName("types")]
    public required string Types { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    public static class InnerTypes
    {
        [Serializable]
        public record TypesPropertyCollisionExtendsChild : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            [JsonPropertyName("foo")]
            public required string Foo { get; set; }

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
