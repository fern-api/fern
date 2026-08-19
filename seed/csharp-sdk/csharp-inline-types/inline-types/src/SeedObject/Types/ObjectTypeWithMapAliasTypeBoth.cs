using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record ObjectTypeWithMapAliasTypeBoth : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prop")]
    public Dictionary<AliasPropertyType, Types.OtherAliasPropertyType> Prop { get; set; } =
        new Dictionary<AliasPropertyType, Types.OtherAliasPropertyType>();

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
        [Serializable]
        public record OtherAliasPropertyType : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            [JsonPropertyName("prop")]
            public required string Prop { get; set; }

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
