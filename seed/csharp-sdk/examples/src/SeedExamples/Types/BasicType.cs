using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<BasicType>))]
public enum BasicType
{
    [EnumMember(Value = "primitive")]
    Primitive,

    [EnumMember(Value = "literal")]
    Literal
}
