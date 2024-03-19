using System.Text.Json.Serialization
using System
using SeedEnumClient.Utilities

namespace SeedEnumClient

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Operand
{
    [EnumMember(Value =">")]
    GreaterThan,
    [EnumMember(Value ="=")]
    EqualTo,
    [EnumMember(Value ="less_than")]
    LessThan,
}
