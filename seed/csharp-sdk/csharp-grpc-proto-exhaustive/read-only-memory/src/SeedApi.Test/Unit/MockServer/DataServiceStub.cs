namespace SeedApi.Test.Unit.MockServer;

public class DataServiceStub : global::Data.V1.Grpc.DataService.DataServiceBase
{
    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.CheckResponse>? _checkHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> CheckRequests { get; } = new();

    public DataServiceStub OnCheck(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.CheckResponse> handler
    )
    {
        _checkHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.CheckResponse> Check(
        Google.Protobuf.WellKnownTypes.Empty request,
        Grpc.Core.ServerCallContext context
    )
    {
        CheckRequests.Add(request);
        if (_checkHandler != null)
        {
            return Task.FromResult(_checkHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.CreateRequest, Data.V1.Grpc.CreateResponse>? _createHandler;

    public List<Data.V1.Grpc.CreateRequest> CreateRequests { get; } = new();

    public DataServiceStub OnCreate(
        Func<Data.V1.Grpc.CreateRequest, Data.V1.Grpc.CreateResponse> handler
    )
    {
        _createHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.CreateResponse> Create(
        Data.V1.Grpc.CreateRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        CreateRequests.Add(request);
        if (_createHandler != null)
        {
            return Task.FromResult(_createHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.DeleteRequest, Data.V1.Grpc.DeleteResponse>? _deleteHandler;

    public List<Data.V1.Grpc.DeleteRequest> DeleteRequests { get; } = new();

    public DataServiceStub OnDelete(
        Func<Data.V1.Grpc.DeleteRequest, Data.V1.Grpc.DeleteResponse> handler
    )
    {
        _deleteHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.DeleteResponse> Delete(
        Data.V1.Grpc.DeleteRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        DeleteRequests.Add(request);
        if (_deleteHandler != null)
        {
            return Task.FromResult(_deleteHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.DescribeRequest, Data.V1.Grpc.DescribeResponse>? _describeHandler;

    public List<Data.V1.Grpc.DescribeRequest> DescribeRequests { get; } = new();

    public DataServiceStub OnDescribe(
        Func<Data.V1.Grpc.DescribeRequest, Data.V1.Grpc.DescribeResponse> handler
    )
    {
        _describeHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.DescribeResponse> Describe(
        Data.V1.Grpc.DescribeRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        DescribeRequests.Add(request);
        if (_describeHandler != null)
        {
            return Task.FromResult(_describeHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.QueryRequest, Data.V1.Grpc.QueryResponse>? _queryHandler;

    public List<Data.V1.Grpc.QueryRequest> QueryRequests { get; } = new();

    public DataServiceStub OnQuery(
        Func<Data.V1.Grpc.QueryRequest, Data.V1.Grpc.QueryResponse> handler
    )
    {
        _queryHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.QueryResponse> Query(
        Data.V1.Grpc.QueryRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        QueryRequests.Add(request);
        if (_queryHandler != null)
        {
            return Task.FromResult(_queryHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.UploadRequest, Data.V1.Grpc.UploadResponse>? _uploadHandler;

    public List<Data.V1.Grpc.UploadRequest> UploadRequests { get; } = new();

    public DataServiceStub OnUpload(
        Func<Data.V1.Grpc.UploadRequest, Data.V1.Grpc.UploadResponse> handler
    )
    {
        _uploadHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.UploadResponse> Upload(
        Data.V1.Grpc.UploadRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        UploadRequests.Add(request);
        if (_uploadHandler != null)
        {
            return Task.FromResult(_uploadHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.FetchRequest, Data.V1.Grpc.FetchResponse>? _fetchHandler;

    public List<Data.V1.Grpc.FetchRequest> FetchRequests { get; } = new();

    public DataServiceStub OnFetch(
        Func<Data.V1.Grpc.FetchRequest, Data.V1.Grpc.FetchResponse> handler
    )
    {
        _fetchHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.FetchResponse> Fetch(
        Data.V1.Grpc.FetchRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        FetchRequests.Add(request);
        if (_fetchHandler != null)
        {
            return Task.FromResult(_fetchHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.ListRequest, Data.V1.Grpc.ListResponse>? _listHandler;

    public List<Data.V1.Grpc.ListRequest> ListRequests { get; } = new();

    public DataServiceStub OnList(Func<Data.V1.Grpc.ListRequest, Data.V1.Grpc.ListResponse> handler)
    {
        _listHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.ListResponse> List(
        Data.V1.Grpc.ListRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        ListRequests.Add(request);
        if (_listHandler != null)
        {
            return Task.FromResult(_listHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }

    private Func<Data.V1.Grpc.UpdateRequest, Data.V1.Grpc.UpdateResponse>? _updateHandler;

    public List<Data.V1.Grpc.UpdateRequest> UpdateRequests { get; } = new();

    public DataServiceStub OnUpdate(
        Func<Data.V1.Grpc.UpdateRequest, Data.V1.Grpc.UpdateResponse> handler
    )
    {
        _updateHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.UpdateResponse> Update(
        Data.V1.Grpc.UpdateRequest request,
        Grpc.Core.ServerCallContext context
    )
    {
        UpdateRequests.Add(request);
        if (_updateHandler != null)
        {
            return Task.FromResult(_updateHandler(request));
        }
        throw new Grpc.Core.RpcException(
            new Grpc.Core.Status(Grpc.Core.StatusCode.Unimplemented, "Method not configured")
        );
    }
}
