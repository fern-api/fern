using SeedExamples.Core;

#nullable enable

namespace SeedExamples.File;

public record GetFileRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
