using global::System.Text.Json.Serialization;

namespace SeedInferredAuthImplicitApiKey.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
