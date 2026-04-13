using Contoso.Net._;
using Contoso.Net.Scimconfiguration;
using Contoso.Net.System;

namespace Contoso.Net;

public partial interface IContosoClient
{
    public IClient _ { get; }
    public IScimconfigurationClient Scimconfiguration { get; }
    public ISystemClient System { get; }
}
