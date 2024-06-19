using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedApi;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<PrimitiveValue>))]
public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
