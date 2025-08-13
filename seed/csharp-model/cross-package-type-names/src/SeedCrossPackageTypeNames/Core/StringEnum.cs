namespace SeedCrossPackageTypeNames.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
