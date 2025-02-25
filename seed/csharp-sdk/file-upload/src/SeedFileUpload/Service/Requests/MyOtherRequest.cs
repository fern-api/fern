using SeedFileUpload.Core;

namespace SeedFileUpload;

public record MyOtherRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
