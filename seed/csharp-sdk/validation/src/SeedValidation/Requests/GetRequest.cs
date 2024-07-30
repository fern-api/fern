namespace SeedValidation;

public record GetRequest
{
    public required double Decimal { get; }

    public required int Even { get; }

    public required string Name { get; }
}
