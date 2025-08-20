package example

import (
    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
    context "context"
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
    client.Imdb.GetMovie(
        context.TODO(),
        "movieId",
    )
}
