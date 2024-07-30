namespace SeedExamples;

public record GetMetadataRequest
{
    public bool? Shallow { get; set; }

    public string? Tag { get; set; }

    public required string XApiVersion { get; set; }
}
