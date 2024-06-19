using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedMixedCase;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

[JsonConverter(typeof(StringEnumSerializer<ResourceStatus>))]
public enum ResourceStatus
{
    [EnumMember(Value = "ACTIVE")]
    Active,

    [EnumMember(Value = "INACTIVE")]
    Inactive
}
