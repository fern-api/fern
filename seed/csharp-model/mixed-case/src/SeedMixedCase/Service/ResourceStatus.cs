using System.Text.Json.Serialization;
using System;
using SeedMixedCase.Utilities;

namespace SeedMixedCase;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum ResourceStatus
{
    [EnumMember(Value = "ACTIVE")]
    Active,

    [EnumMember(Value = "INACTIVE")]
    Inactive
}
