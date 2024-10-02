using System.Text.Json.Serialization;

namespace SeedMultiUrlEnvironment.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
