using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record ListUsersRequest
{
    /// <summary>
    /// Page index of the results to return. First page is 0.
    /// </summary>
    [JsonIgnore]
    public int? Page { get; set; }

    /// <summary>
    /// Number of results per page.
    /// </summary>
    [JsonIgnore]
    public int? PerPage { get; set; }

    /// <summary>
    /// Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    /// </summary>
    [JsonIgnore]
    public bool? IncludeTotals { get; set; }

    /// <summary>
    /// Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    /// </summary>
    [JsonIgnore]
    public string? Sort { get; set; }

    /// <summary>
    /// Connection filter
    /// </summary>
    [JsonIgnore]
    public string? Connection { get; set; }

    /// <summary>
    /// Query string following Lucene query string syntax
    /// </summary>
    [JsonIgnore]
    public string? Q { get; set; }

    /// <summary>
    /// Search engine version (v1, v2, or v3)
    /// </summary>
    [JsonIgnore]
    public string? SearchEngine { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include or exclude
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
