using SeedMixedCase;
using System.Text.Json.Serialization;

namespace SeedMixedCase;

public class Resource
{
    public class _User : User, _IBase
    {
        [JsonPropertyName("resource_type")]
        public string ResourceType { get; } = "user";
    }
    public class _Organization : Organization, _IBase
    {
        [JsonPropertyName("resource_type")]
        public string ResourceType { get; } = "Organization";
    }
    namespace SeedMixedCase;

    private interface _IBase
    {
        [JsonPropertyName("status")]
        public ResourceStatus Status { get; init; }
    }
}
