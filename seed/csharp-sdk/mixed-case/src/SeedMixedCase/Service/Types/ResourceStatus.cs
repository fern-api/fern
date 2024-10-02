using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

#nullable enable

namespace SeedMixedCase;

[JsonConverter(typeof(EnumSerializer<ResourceStatus>))]
public enum ResourceStatus
{
    [EnumMember(Value = "ACTIVE")]
    Active,

    [EnumMember(Value = "INACTIVE")]
    Inactive,
}
