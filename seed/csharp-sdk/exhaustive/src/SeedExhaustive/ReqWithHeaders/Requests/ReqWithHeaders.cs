namespace SeedExhaustive;

public record ReqWithHeaders
{
    public required string XTestEndpointHeader { get; init; }

    public required string Body { get; init; }
}
