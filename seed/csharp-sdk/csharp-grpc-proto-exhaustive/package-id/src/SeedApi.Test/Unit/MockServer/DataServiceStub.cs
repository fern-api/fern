using Data.V1.Grpc;

namespace SeedApi.Test.Unit.MockServer;

public class DataServiceStub : DataService.DataServiceBase
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
        ServerCallContext context
    )
    {
        CheckRequests.Add(request);
        if (_checkHandler != null)
        {
            return Task.FromResult(_checkHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.CreateResponse>? _createHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> CreateRequests { get; } = new();

    public DataServiceStub OnCreate(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.CreateResponse> handler
    )
    {
        _createHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.CreateResponse> Create(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        CreateRequests.Add(request);
        if (_createHandler != null)
        {
            return Task.FromResult(_createHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.DeleteResponse>? _deleteHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> DeleteRequests { get; } = new();

    public DataServiceStub OnDelete(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.DeleteResponse> handler
    )
    {
        _deleteHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.DeleteResponse> Delete(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        DeleteRequests.Add(request);
        if (_deleteHandler != null)
        {
            return Task.FromResult(_deleteHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<
        Google.Protobuf.WellKnownTypes.Empty,
        Data.V1.Grpc.DescribeResponse
    >? _describeHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> DescribeRequests { get; } = new();

    public DataServiceStub OnDescribe(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.DescribeResponse> handler
    )
    {
        _describeHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.DescribeResponse> Describe(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        DescribeRequests.Add(request);
        if (_describeHandler != null)
        {
            return Task.FromResult(_describeHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.QueryResponse>? _queryHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> QueryRequests { get; } = new();

    public DataServiceStub OnQuery(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.QueryResponse> handler
    )
    {
        _queryHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.QueryResponse> Query(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        QueryRequests.Add(request);
        if (_queryHandler != null)
        {
            return Task.FromResult(_queryHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.UploadResponse>? _uploadHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> UploadRequests { get; } = new();

    public DataServiceStub OnUpload(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.UploadResponse> handler
    )
    {
        _uploadHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.UploadResponse> Upload(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        UploadRequests.Add(request);
        if (_uploadHandler != null)
        {
            return Task.FromResult(_uploadHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.FetchResponse>? _fetchHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> FetchRequests { get; } = new();

    public DataServiceStub OnFetch(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.FetchResponse> handler
    )
    {
        _fetchHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.FetchResponse> Fetch(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        FetchRequests.Add(request);
        if (_fetchHandler != null)
        {
            return Task.FromResult(_fetchHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.ListResponse>? _listHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> ListRequests { get; } = new();

    public DataServiceStub OnList(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.ListResponse> handler
    )
    {
        _listHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.ListResponse> List(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        ListRequests.Add(request);
        if (_listHandler != null)
        {
            return Task.FromResult(_listHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }

    private Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.UpdateResponse>? _updateHandler;

    public List<Google.Protobuf.WellKnownTypes.Empty> UpdateRequests { get; } = new();

    public DataServiceStub OnUpdate(
        Func<Google.Protobuf.WellKnownTypes.Empty, Data.V1.Grpc.UpdateResponse> handler
    )
    {
        _updateHandler = handler;
        return this;
    }

    public override Task<Data.V1.Grpc.UpdateResponse> Update(
        Google.Protobuf.WellKnownTypes.Empty request,
        ServerCallContext context
    )
    {
        UpdateRequests.Add(request);
        if (_updateHandler != null)
        {
            return Task.FromResult(_updateHandler(request));
        }
        throw new RpcException(new Status(StatusCode.Unimplemented, "Method not configured"));
    }
}
