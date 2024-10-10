namespace <%= namespace%>;

internal static class StringEnumExtensions
{
    public static string Stringify(this IStringEnum stringEnum) => stringEnum.Value;
}