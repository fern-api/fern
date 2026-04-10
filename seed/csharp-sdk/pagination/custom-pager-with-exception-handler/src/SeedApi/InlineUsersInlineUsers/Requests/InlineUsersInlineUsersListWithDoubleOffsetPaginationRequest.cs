using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    [JsonIgnore]
    public double? Page { get; set; }

    /// <summary>
    /// Defaults to per page
    /// </summary>
    [JsonIgnore]
    public double? PerPage { get; set; }

    [JsonIgnore]
    public InlineUsersOrder? Order { get; set; }

    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    [JsonIgnore]
    public string? StartingAfter { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
