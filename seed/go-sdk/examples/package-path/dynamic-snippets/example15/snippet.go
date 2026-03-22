package example

import (
    context "context"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &pleaseinhere.Movie{
        Id: "movie-c06a4ad7",
        Prequel: pleaseinhere.String(
            "movie-cv9b914f",
        ),
        Title: "The Boy and the Heron",
        From: "Hayao Miyazaki",
        Rating: 8,
        Tag: "tag-wf9as23d",
        Metadata: map[string]any{
            "actors": []any{
                "Christian Bale",
                "Florence Pugh",
                "Willem Dafoe",
            },
            "ratings": map[string]any{
                "imdb": 7.6,
                "rottenTomatoes": 97,
            },
            "releaseDate": "2023-12-08",
        },
        Revenue: int64(1000000),
    }
    client.Service.CreateMovie(
        context.TODO(),
        request,
    )
}
