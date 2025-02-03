using SeedFileUpload.Core;

namespace SeedFileUpload;

public record MyRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
