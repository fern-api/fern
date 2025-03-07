using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;
using OneOf;

namespace Usage;

public class Example15
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.UpdateAsync(
            new UpdateRequest{
                Id = "id",
                Values = new List<float>(){
                    1.1f,
                    1.1f,
                },
                SetMetadata = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["setMetadata"] = 1.1,
                },
                Namespace = "namespace",
                IndexedData = new IndexedData{
                    Indices = new List<uint>(){
                        1u,
                        1u,
                    },
                    Values = new List<float>(){
                        1.1f,
                        1.1f,
                    }
                },
                IndexType = IndexType.IndexTypeInvalid,
                Details = new Dictionary<string, object>(){
                    ["details"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                },
                IndexTypes = new List<IndexType>(){
                    IndexType.IndexTypeInvalid,
                    IndexType.IndexTypeInvalid,
                }
            }
        );
    }

}
