using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[Serializable]
public record PaginatedConversationResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("conversations")]
    public IEnumerable<Conversation> Conversations { get; set; } = new List<Conversation>();

    [JsonPropertyName("pages")]
    public CursorPages? Pages { get; set; }

    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "conversation.list";

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
