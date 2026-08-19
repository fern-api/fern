namespace SeedErrorProperty;

public partial interface ISeedErrorPropertyClient
{
    public IPropertyBasedErrorClient PropertyBasedError { get; }
}
