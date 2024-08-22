using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record TerminatedResponse
{
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
