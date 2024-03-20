using System.Text.Json.Serialization;
using System;
using SeedApiClient.Utilities;

namespace SeedApiClient;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum PrimitiveValue
{
    [EnumMember(Value = "STRING")]
    String,

    [EnumMember(Value = "NUMBER")]
    Number
}
