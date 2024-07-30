namespace SeedAudiences;

public record FindRequest
{
    public string? OptionalString { get; set; }

    public string? PublicProperty { get; set; }

    public int? PrivateProperty { get; set; }
}
