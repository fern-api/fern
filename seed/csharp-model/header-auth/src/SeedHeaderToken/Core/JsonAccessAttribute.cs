namespace SeedHeaderToken.Core;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
internal class JsonAccessAttribute(JsonAccessType accessType) : Attribute
{
    internal JsonAccessType AccessType { get; init; } = accessType;
}

internal enum JsonAccessType
{
    ReadOnly,
    WriteOnly,
}
