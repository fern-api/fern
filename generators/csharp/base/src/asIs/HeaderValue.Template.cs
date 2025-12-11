using OneOf;

namespace <%= namespace%>;

internal sealed class HeaderValue(
    OneOf<
        string,
        Func<string>,
        Func<ValueTask<string>>,
        Func<Task<string>>
    > value
)
    : OneOfBase<
        string,
        Func<string>,
        Func<ValueTask<string>>,
        Func<Task<string>>
    >(value)
{
    public static implicit operator HeaderValue(string value) => new(value);
    public static implicit operator HeaderValue(Func<string> value) => new(value);
    public static implicit operator HeaderValue(Func<ValueTask<string>> value) => new(value);
    public static implicit operator HeaderValue(Func<Task<string>> value) => new(value);

    internal ValueTask<string> ResolveAsync()
    {
        return Match(
            str => new ValueTask<string>(str),
            syncFunc => new ValueTask<string>(syncFunc()),
            valueTaskFunc => valueTaskFunc(),
            taskFunc => new ValueTask<string>(taskFunc())
        );
    }
}
