using SeedCrossPackageTypeNames.FolderA;
using SeedCrossPackageTypeNames.FolderD;

namespace SeedCrossPackageTypeNames;

public partial interface ISeedCrossPackageTypeNamesClient
{
    public FolderAClient FolderA { get; }
    public FolderDClient FolderD { get; }
    public FooClient Foo { get; }
}
