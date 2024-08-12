namespace SeedExhaustive.Endpoints;

public record GetWithQuery
{
    public required string Query { get; set; }

    public required int Number { get; set; }
}
