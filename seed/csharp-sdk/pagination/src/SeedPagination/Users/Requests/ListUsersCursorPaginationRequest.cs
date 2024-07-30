using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersCursorPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    public int? Page { get; set; }

    /// <summary>
    /// Defaults to per page
    /// </summary>
    public int? PerPage { get; set; }

    public Order? Order { get; set; }

    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    public string? StartingAfter { get; set; }
}
