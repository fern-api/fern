using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.QueryAsync(
            new QueryRequest {
                Namespace = "namespace",
                TopK = 1u,
                Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["filter"] = 1.1,
                }
                ,
                IncludeValues = true,
                IncludeMetadata = true,
                Queries = new List<QueryColumn>(){
                    new QueryColumn {
                        Values = new List<float>(){
                            1.1f,
                            1.1f,
                        }
                        ,
                        TopK = 1u,
                        Namespace = "namespace",
                        Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                            ["filter"] = 1.1,
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
                    new QueryColumn {
                        Values = new List<float>(){
                            1.1f,
                            1.1f,
                        }
                        ,
                        TopK = 1u,
                        Namespace = "namespace",
                        Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                            ["filter"] = 1.1,
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
                Column = new List<float>(){
                    1.1f,
                    1.1f,
                }
                ,
                Id = "id",
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
            }
        );
    }

}
