using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersDoubleOffsetPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    public double? Page { get; set; }

    /// <summary>
    /// Defaults to per page
    /// </summary>
    public double? PerPage { get; set; }

    public Order? Order { get; set; }

    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    public string? StartingAfter { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
