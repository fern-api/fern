namespace SeedAudiences;

public record FindRequest
{
    public string? OptionalString { get; }

    public string? PublicProperty { get; }

    public int? PrivateProperty { get; }
}
