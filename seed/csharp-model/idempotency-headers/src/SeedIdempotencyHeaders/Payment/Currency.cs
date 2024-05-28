using System.Runtime.Serialization;

#nullable enable

namespace SeedIdempotencyHeaders;

public enum Currency
{
    [EnumMember(Value = "USD")]
    Usd,

    [EnumMember(Value = "YEN")]
    Yen
}
