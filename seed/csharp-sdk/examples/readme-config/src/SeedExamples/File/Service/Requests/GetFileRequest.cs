using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples.File;

[Serializable]
public record GetFileRequest
{
    [JsonIgnore]
    public required string XFileApiVersion { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
