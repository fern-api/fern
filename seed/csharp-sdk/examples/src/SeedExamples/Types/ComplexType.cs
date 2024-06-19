using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<ComplexType>))]
public enum ComplexType
{
    [EnumMember(Value = "object")]
    Object,

    [EnumMember(Value = "union")]
    Union,

    [EnumMember(Value = "unknown")]
    Unknown
}
