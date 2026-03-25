package example

import (
    context "context"

    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
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
