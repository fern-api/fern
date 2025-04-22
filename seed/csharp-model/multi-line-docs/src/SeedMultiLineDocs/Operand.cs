using System.Text.Json.Serialization;
using SeedMultiLineDocs.Core;
using System.Runtime.Serialization;

namespace SeedMultiLineDocs;

[JsonConverter(typeof(EnumSerializer<Operand>))]
public enum Operand
{
    [EnumMember(Value = ">")]GreaterThan,

    [EnumMember(Value = "=")]EqualTo,

    [EnumMember(Value = "less_than")]LessThan
}
