using System.Runtime.Serialization;

namespace SeedIdempotencyHeaders;

public enum Currency
{
    [EnumMember(Value = "USD")]
    Usd,

    [EnumMember(Value = "YEN")]
    Yen
}
