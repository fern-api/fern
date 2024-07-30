namespace SeedExhaustive.Endpoints.Params;

public record GetWithMultipleQuery
{
    public required string Query { get; set; }

    public required int Numer { get; set; }
}
