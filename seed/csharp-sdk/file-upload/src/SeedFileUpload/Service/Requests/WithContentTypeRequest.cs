using SeedFileUpload.Core;

namespace SeedFileUpload;

public record WithContentTypeRequest
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
