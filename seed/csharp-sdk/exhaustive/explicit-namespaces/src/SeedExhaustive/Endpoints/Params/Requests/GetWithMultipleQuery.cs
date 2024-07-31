namespace SeedExhaustive.Endpoints.Params;

public record GetWithMultipleQuery
{
    public IEnumerable<string> Query { get; set; } = new List<string>();

    public IEnumerable<int> Numer { get; set; } = new List<int>();
}
