using OneOf;

namespace SeedMixedFileDirectory.Core;

internal sealed class HeaderValue(
    OneOf<
        string,
        Func<string>,
        Func<global::System.Threading.Tasks.ValueTask<string>>,
        Func<global::System.Threading.Tasks.Task<string>>
    > value
)
    : OneOfBase<
        string,
        Func<string>,
        Func<global::System.Threading.Tasks.ValueTask<string>>,
        Func<global::System.Threading.Tasks.Task<string>>
    >(value)
{
    public static implicit operator HeaderValue(string value) => new(value);

    public static implicit operator HeaderValue(Func<string> value) => new(value);

    public static implicit operator HeaderValue(
        Func<global::System.Threading.Tasks.ValueTask<string>> value
    ) => new(value);

    public static implicit operator HeaderValue(
        Func<global::System.Threading.Tasks.Task<string>> value
    ) => new(value);

    internal global::System.Threading.Tasks.ValueTask<string> ResolveAsync()
    {
        return Match(
            str => new global::System.Threading.Tasks.ValueTask<string>(str),
            syncFunc => new global::System.Threading.Tasks.ValueTask<string>(syncFunc()),
            valueTaskFunc => valueTaskFunc(),
            taskFunc => new global::System.Threading.Tasks.ValueTask<string>(taskFunc())
        );
    }
}
