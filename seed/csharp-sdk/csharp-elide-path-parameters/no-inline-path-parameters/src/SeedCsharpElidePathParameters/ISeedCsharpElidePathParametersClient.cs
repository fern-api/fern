namespace SeedCsharpElidePathParameters;

public partial interface ISeedCsharpElidePathParametersClient
{
    public IBytesClient Bytes { get; }
    public IEndpointHeadersClient EndpointHeaders { get; }
    public IHeadersClient Headers { get; }
}
