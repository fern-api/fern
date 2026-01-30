using SeedCrossPackageTypeNames.FolderA;
using SeedCrossPackageTypeNames.FolderD;

namespace SeedCrossPackageTypeNames;

public partial interface ISeedCrossPackageTypeNamesClient
{
    public IFolderAClient FolderA { get; }
    public IFolderDClient FolderD { get; }
    public IFooClient Foo { get; }
}
