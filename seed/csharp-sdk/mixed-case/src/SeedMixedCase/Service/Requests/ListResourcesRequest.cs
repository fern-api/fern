namespace SeedMixedCase;

public record ListResourcesRequest
{
    public required int PageLimit { get; init; }

    public required DateOnly BeforeDate { get; init; }
}
