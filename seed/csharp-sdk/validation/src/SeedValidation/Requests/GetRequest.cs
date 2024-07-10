namespace SeedValidation;

public record GetRequest
{
    public required double Decimal { get; init; }

    public required int Even { get; init; }

    public required string Name { get; init; }
}
