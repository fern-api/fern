using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedIdempotencyHeaders.Core;

#nullable enable

namespace SeedIdempotencyHeaders;

[JsonConverter(typeof(EnumSerializer<Currency>))]
public enum Currency
{
    [EnumMember(Value = "USD")]
    Usd,

    [EnumMember(Value = "YEN")]
    Yen,
}
