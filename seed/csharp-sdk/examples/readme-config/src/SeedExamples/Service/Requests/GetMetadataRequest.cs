using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record GetMetadataRequest
{
    [JsonIgnore]
    public bool? Shallow { get; set; }

    [JsonIgnore]
    public IEnumerable<string> Tag { get; set; } = new List<string>();

    [JsonIgnore]
    public required string XApiVersion { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
