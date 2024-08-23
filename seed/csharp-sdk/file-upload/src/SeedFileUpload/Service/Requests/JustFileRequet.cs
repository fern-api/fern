using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

public record JustFileRequet
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
