using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum;
using SeedEnum.Core;

#nullable enable

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<Operand>))]
public enum Operand
{
    [EnumMember(Value = ">")]
    GreaterThan,

    [EnumMember(Value = "=")]
    EqualTo,

    [EnumMember(Value = "less_than")]
    LessThan
}
