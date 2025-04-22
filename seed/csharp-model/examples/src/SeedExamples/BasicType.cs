using System.Text.Json.Serialization;
using SeedExamples.Core;
using System.Runtime.Serialization;

namespace SeedExamples;

[JsonConverter(typeof(EnumSerializer<BasicType>))]
public enum BasicType
{
    [EnumMember(Value = "primitive")]Primitive,

    [EnumMember(Value = "literal")]Literal
}
