namespace SeedAudiences;

public record FindRequest
{
    public string? OptionalString { get; init; }

    public string? PublicProperty { get; init; }

    public int? PrivateProperty { get; init; }
}
