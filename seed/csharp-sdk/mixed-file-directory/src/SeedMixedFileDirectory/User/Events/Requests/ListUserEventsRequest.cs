using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.User;

public record ListUserEventsRequest
{
    /// <summary>
    /// The maximum number of results to return.
    /// </summary>
    public int? Limit { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
