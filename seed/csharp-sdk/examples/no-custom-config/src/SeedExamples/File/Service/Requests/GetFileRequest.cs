using System.Text.Json.Serialization;

namespace SeedExamples.File;

[Serializable]
public record GetFileRequest
{
    [JsonIgnore]
    public required string XFileApiVersion { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExamples.Core.JsonUtils.Serialize(this);
    }
}
