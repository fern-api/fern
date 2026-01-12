using SeedAudiences.FolderA;
using SeedAudiences.FolderD;

namespace SeedAudiences;

public partial interface ISeedAudiencesClient
{
    public FolderAClient FolderA { get; }
    public FolderDClient FolderD { get; }
    public FooClient Foo { get; }
}
