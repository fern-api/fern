using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;

namespace SeedMultiLineDocs;

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
