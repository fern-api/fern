package example

import (
    fern "github.com/imdb/fern"
    option "github.com/imdb/fern/option"
    context "context"
)

func do() {
    client := fern.New(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Imdb.GetMovie(
        context.TODO(),
        "movieId",
    )
}
