using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<ForwardCompatibleEnum>))]
public enum ForwardCompatibleEnum
{
    [EnumMember(Value = "active")]
    Active,

    [EnumMember(Value = "inactive")]
    Inactive,
}
