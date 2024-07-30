namespace SeedMixedCase;

public record ListResourcesRequest
{
    public required int PageLimit { get; }

    public required DateOnly BeforeDate { get; }
}
