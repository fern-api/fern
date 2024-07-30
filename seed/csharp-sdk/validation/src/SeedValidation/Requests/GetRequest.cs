namespace SeedValidation;

public record GetRequest
{
    public required double Decimal { get; set; }

    public required int Even { get; set; }

    public required string Name { get; set; }
}
