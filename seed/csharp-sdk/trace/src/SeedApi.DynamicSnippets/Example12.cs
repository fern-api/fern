using SeedTrace;
using System.Globalization;

namespace Usage;

public class Example12
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Playlist.CreatePlaylistAsync(
            1,
            new CreatePlaylistRequest {
                Datetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                OptionalDatetime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal),
                Body = new PlaylistCreateRequest {
                    Name = "name",
                    Problems = new List<string>(){
                        "problems",
                        "problems",
                    }

                }
            }
        );
    }

}
