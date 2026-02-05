using SeedAudiences.FolderA;
using SeedAudiences.FolderD;

namespace SeedAudiences;

public partial interface ISeedAudiencesClient
{
    public IFolderAClient FolderA { get; }
    public IFolderDClient FolderD { get; }
    public IFooClient Foo { get; }
}
