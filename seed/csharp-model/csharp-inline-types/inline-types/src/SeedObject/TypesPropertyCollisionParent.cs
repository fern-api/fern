using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record TypesPropertyCollisionParent : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// This property collides with the default nested class name "Types"
    /// </summary>
    [JsonPropertyName("types")]
    public required string Types { get; set; }

    /// <summary>
    /// This inline child should be nested inside InnerTypes instead of Types
    /// </summary>
    [JsonPropertyName("child")]
    public required InnerTypes.TypesPropertyCollisionChild Child { get; set; }

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
        public record TypesPropertyCollisionChild : IJsonOnDeserialized
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
