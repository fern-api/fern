using SeedPagination;

#nullable enable

namespace SeedPagination;

public record ListUsersCursorPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    public int? Page { get; }

    /// <summary>
    /// Defaults to per page
    /// </summary>
    public int? PerPage { get; }

    public Order? Order { get; }

    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    public string? StartingAfter { get; }
}
