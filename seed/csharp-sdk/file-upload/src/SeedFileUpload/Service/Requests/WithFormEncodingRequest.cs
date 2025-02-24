using SeedFileUpload.Core;

namespace SeedFileUpload;

public record WithFormEncodingRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
