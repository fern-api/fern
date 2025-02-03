using SeedTrace.Core;

namespace SeedTrace;

public record TerminatedResponse
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
