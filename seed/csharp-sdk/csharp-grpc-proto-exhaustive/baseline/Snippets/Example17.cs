using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example17() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.UpdateAsync(
            new UpdateRequest {
                Id = "id",
                Values = new List<float>(){
                    1.1f,
                    1.1f,
                }
                ,
                SetMetadata = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["set_metadata"] = 1.1,
                }
                ,
                Namespace = "namespace",
                IndexedData = new IndexedData {
                    Indices = new List<uint>(){
                        1u,
                        1u,
                    }
                    ,
                    Values = new List<float>(){
                        1.1f,
                        1.1f,
                    }

                },
                IndexType = IndexType.IndexTypeInvalid,
                Details = new GoogleProtobufAny {
                    Type = "@type"
                },
                IndexTypes = new List<IndexType>(){
                    IndexType.IndexTypeInvalid,
                    IndexType.IndexTypeInvalid,
                }
                ,
                AspectRatio = AspectRatio.AspectRatioUnspecified,
                Status = new GoogleRpcStatus {
                    Code = 1,
                    Message = "message",
                    Details = new List<GoogleProtobufAny>(){
                        new GoogleProtobufAny {
                            Type = "@type"
                        },
                        new GoogleProtobufAny {
                            Type = "@type"
                        },
                    }

                },
                Content = "SGVsbG8gd29ybGQh"
            }
        );
    }

}
