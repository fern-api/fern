using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<Status>))]
public enum Status
{
    [EnumMember(Value = "Known")]
    Known,

    [EnumMember(Value = "Unknown")]
    Unknown,
}
