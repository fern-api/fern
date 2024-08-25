namespace SeedExhaustive;

public record ReqWithHeaders
{
    public required string XTestEndpointHeader { get; }

    public required string Body { get; }
}
