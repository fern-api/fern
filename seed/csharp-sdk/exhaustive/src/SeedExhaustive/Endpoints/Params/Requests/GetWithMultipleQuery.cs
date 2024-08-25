namespace SeedExhaustive.Endpoints;

public record GetWithMultipleQuery
{
    public required string Query { get; }

    public required int Numer { get; }
}
