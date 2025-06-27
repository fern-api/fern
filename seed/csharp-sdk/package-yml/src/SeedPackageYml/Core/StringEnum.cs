using System.Text.Json.Serialization;

namespace SeedPackageYml.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
