using SeedExamples.Core;

namespace SeedExamples.File;

public record GetFileRequest
{
    public required string XFileApiVersion { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
