namespace SeedExhaustive.Endpoints;

public record GetWithQuery
{
    public required string Query { get; init; }

    public required int Number { get; init; }
}
