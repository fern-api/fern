using System.Text.Json.Serialization;
using SeedEnum.Core;
using System.Runtime.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<Status>))]
public enum Status
{
    [EnumMember(Value = "Known")]Known,

    [EnumMember(Value = "Unknown")]Unknown
}
