using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record ListClientsRequest
{
    /// <summary>
    /// Comma-separated list of fields to include
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <summary>
    /// Whether specified fields are included or excluded
    /// </summary>
    [JsonIgnore]
    public bool? IncludeFields { get; set; }

    /// <summary>
    /// Page number (zero-based)
    /// </summary>
    [JsonIgnore]
    public int? Page { get; set; }

    /// <summary>
    /// Number of results per page
    /// </summary>
    [JsonIgnore]
    public int? PerPage { get; set; }

    /// <summary>
    /// Include total count in response
    /// </summary>
    [JsonIgnore]
    public bool? IncludeTotals { get; set; }

    /// <summary>
    /// Filter by global clients
    /// </summary>
    [JsonIgnore]
    public bool? IsGlobal { get; set; }

    /// <summary>
    /// Filter by first party clients
    /// </summary>
    [JsonIgnore]
    public bool? IsFirstParty { get; set; }

    /// <summary>
    /// Filter by application type (spa, native, regular_web, non_interactive)
    /// </summary>
    [JsonIgnore]
    public IEnumerable<string>? AppType { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
