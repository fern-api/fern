namespace SeedExhaustive.Endpoints;

public record GetWithQuery
{
    public required string Query { get; }

    public required int Number { get; }
}
