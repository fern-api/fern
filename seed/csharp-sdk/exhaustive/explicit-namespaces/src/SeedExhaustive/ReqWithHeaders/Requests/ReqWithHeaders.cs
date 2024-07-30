namespace SeedExhaustive.ReqWithHeaders;

public record ReqWithHeaders
{
    public required string XTestEndpointHeader { get; set; }

    public required string Body { get; set; }
}
