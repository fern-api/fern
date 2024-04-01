using System.Text.Json.Serialization;
using System;
using SeedIdempotencyHeaders.Utilities;

namespace SeedIdempotencyHeaders;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Currency
{
    [EnumMember(Value = "USD")]
    Usd,

    [EnumMember(Value = "YEN")]
    Yen
}
