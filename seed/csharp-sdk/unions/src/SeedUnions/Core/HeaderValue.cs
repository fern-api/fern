using OneOf;

namespace SeedUnions.Core;

internal sealed class HeaderValue(OneOf<string, Func<string>> value)
    : OneOfBase<string, Func<string>>(value)
{
    public static implicit operator HeaderValue(string value)
    {
        return new HeaderValue(value);
    }

    public static implicit operator HeaderValue(Func<string> value)
    {
        return new HeaderValue(value);
    }
}
