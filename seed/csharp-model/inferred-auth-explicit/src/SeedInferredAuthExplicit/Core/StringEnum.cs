using System.Text.Json.Serialization;

namespace SeedInferredAuthExplicit.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
