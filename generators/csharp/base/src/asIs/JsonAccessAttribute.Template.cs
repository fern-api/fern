namespace <%= namespace%>;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
internal class JsonAccessAttribute(JsonAccessType accessType) : System.Attribute
{
    internal JsonAccessType AccessType { get; init; } = accessType;
}

internal enum JsonAccessType
{
    ReadOnly,
    WriteOnly
}
