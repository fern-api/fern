package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    fern "github.com/examples/fern"
    context "context"
)

func do() {
    client := client.NewAcme(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.Movie{
        Id: "movie-c06a4ad7",
        Prequel: fern.String(
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
            "releaseDate": "2023-12-08",
            "ratings": map[string]any{
                "rottenTomatoes": 97,
                "imdb": 7.6,
            },
        },
        Revenue: int64(1000000),
    }
    client.Service.CreateMovie(
        context.TODO(),
        request,
    )
}
