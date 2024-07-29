namespace SeedExhaustive.Endpoints.Params;

public record GetWithQuery
{
    public required string Query { get; init; }

    public required int Number { get; init; }
}
