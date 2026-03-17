namespace SeedApi;

public partial interface IDataServiceClient
{
    Task<CreateResponse> CreateAsync(
        CreateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<DeleteResponse> DeleteAsync(
        DeleteRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<DescribeResponse> DescribeAsync(
        DescribeRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<QueryResponse> QueryAsync(
        QueryRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<UploadResponse> UploadAsync(
        UploadRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<FetchResponse> FetchAsync(
        FetchRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<ListResponse> ListAsync(
        ListRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<UpdateResponse> UpdateAsync(
        UpdateRequest request,
        GrpcRequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
