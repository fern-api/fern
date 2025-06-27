using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[Serializable]
public record Page : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The current page
    /// </summary>
    [JsonPropertyName("page")]
    public required int Page_ { get; set; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; set; }

    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("total_page")]
    public required int TotalPage { get; set; }

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
