using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<Operand>))]
public enum Operand
{
    [EnumMember(Value = ">")]
    GreaterThan,

    [EnumMember(Value = "=")]
    EqualTo,

    [EnumMember(Value = "less_than")]
    LessThan,
}
