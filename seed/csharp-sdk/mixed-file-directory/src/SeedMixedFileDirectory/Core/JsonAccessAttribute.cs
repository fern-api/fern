namespace SeedMixedFileDirectory.Core;

[global::System.AttributeUsage(
    global::System.AttributeTargets.Property | global::System.AttributeTargets.Field
)]
internal class JsonAccessAttribute(JsonAccessType accessType) : global::System.Attribute
{
    internal JsonAccessType AccessType { get; init; } = accessType;
}

internal enum JsonAccessType
{
    ReadOnly,
    WriteOnly,
}
