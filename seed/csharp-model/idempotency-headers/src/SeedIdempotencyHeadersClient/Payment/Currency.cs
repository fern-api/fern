using System.Text.Json.Serialization;
using System;
using SeedIdempotencyHeadersClient.Utilities;

namespace SeedIdempotencyHeadersClient;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Currency
{
    [EnumMember(Value = "USD")]
    Usd,

    [EnumMember(Value = "YEN")]
    Yen
}
