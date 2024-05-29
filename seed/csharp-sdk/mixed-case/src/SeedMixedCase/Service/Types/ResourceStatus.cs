using System.Runtime.Serialization;

#nullable enable

namespace SeedMixedCase;

public enum ResourceStatus
{
    [EnumMember(Value = "ACTIVE")]
    Active,

    [EnumMember(Value = "INACTIVE")]
    Inactive
}
