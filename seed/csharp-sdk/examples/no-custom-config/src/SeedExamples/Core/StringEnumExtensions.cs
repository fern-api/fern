namespace SeedExamples.Core;

internal static class StringEnumExtensions
{
    [global::System.Obsolete("Use ValueConvert.ToString() instead.")]
    public static string Stringify(this IStringEnum stringEnum) => stringEnum.Value;
}
