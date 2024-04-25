using System.Runtime.Serialization;

namespace SeedMixedCase;

public enum ResourceStatus
{
    [EnumMember(Value = "ACTIVE")]
    Active,

    [EnumMember(Value = "INACTIVE")]
    Inactive
}
