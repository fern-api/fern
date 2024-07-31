namespace SeedExamples;

public record GetMetadataRequest
{
    public bool? Shallow { get; set; }

    public IEnumerable<string> Tag { get; set; } = new List<string>();

    public required string XApiVersion { get; set; }
}
