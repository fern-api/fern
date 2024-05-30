using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;

#nullable enable

namespace SeedMultiLineDocs;

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
