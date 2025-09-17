using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination;
using SeedPagination.Core;

namespace SeedPagination.InlineUsers;

[Serializable]
public record ListUsersMixedTypePaginationResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("next")]
    public required string Next { get; set; }

    [JsonPropertyName("data")]
    public required Users Data { get; set; }

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
