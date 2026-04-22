using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.UploadAsync(
            new UploadRequest {
                Columns = new List<Column>(){
                    new Column {
                        Id = "id",
                        Values = new List<float>(){
                            1.1f,
                            1.1f,
                        }
                        ,
                        Metadata = new Dictionary<string, OneOf<double, string, bool>>(){
                            ["metadata"] = 1.1,
                        }
                        ,
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

                        }
                    },
                    new Column {
                        Id = "id",
                        Values = new List<float>(){
                            1.1f,
                            1.1f,
                        }
                        ,
                        Metadata = new Dictionary<string, OneOf<double, string, bool>>(){
                            ["metadata"] = 1.1,
                        }
                        ,
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

                        }
                    },
                }
                ,
                Namespace = "namespace"
            }
        );
    }

}
