using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

public record JustFileRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
