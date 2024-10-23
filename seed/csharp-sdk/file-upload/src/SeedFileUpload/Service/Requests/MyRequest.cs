using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

public record MyRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
