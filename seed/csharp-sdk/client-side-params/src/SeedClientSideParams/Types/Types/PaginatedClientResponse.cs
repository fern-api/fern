using System.Text.Json;
using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

/// <summary>
/// Paginated response for clients listing
/// </summary>
[Serializable]
public record PaginatedClientResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Starting index (zero-based)
    /// </summary>
    [JsonPropertyName("start")]
    public required int Start { get; set; }

    /// <summary>
    /// Number of items requested
    /// </summary>
    [JsonPropertyName("limit")]
    public required int Limit { get; set; }

    /// <summary>
    /// Number of items returned
    /// </summary>
    [JsonPropertyName("length")]
    public required int Length { get; set; }

    /// <summary>
    /// Total number of items (when include_totals=true)
    /// </summary>
    [JsonPropertyName("total")]
    public int? Total { get; set; }

    /// <summary>
    /// List of clients
    /// </summary>
    [JsonPropertyName("clients")]
    public IEnumerable<Client> Clients { get; set; } = new List<Client>();

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
