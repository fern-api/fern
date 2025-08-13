using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record ListResourcesRequest
{
    /// <summary>
    /// Zero-indexed page number
    /// </summary>
    [JsonIgnore]
    public required int Page { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    [JsonIgnore]
    public required int PerPage { get; set; }

    /// <summary>
    /// Sort field
    /// </summary>
    [JsonIgnore]
    public required string Sort { get; set; }

    /// <summary>
    /// Sort order (asc or desc)
    /// </summary>
    [JsonIgnore]
    public required string Order { get; set; }

    /// <summary>
    /// Whether to include total count
    /// </summary>
    [JsonIgnore]
    public required bool IncludeTotals { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <summary>
    /// Search query
    /// </summary>
    [JsonIgnore]
    public string? Search { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
