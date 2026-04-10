using global::Contoso.Net._;
using global::Contoso.Net.Scimconfiguration;
using global::Contoso.Net.System;

namespace Contoso.Net;

public partial interface IContoso
{
    public IClient _ { get; }
    public IScimconfigurationClient Scimconfiguration { get; }
    public ISystemClient System { get; }
}
