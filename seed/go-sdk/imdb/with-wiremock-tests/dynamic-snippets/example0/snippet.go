package example

import (
    context "context"

    testPackageName "github.com/imdb/fern"
    client "github.com/imdb/fern/client"
    option "github.com/imdb/fern/option"
)

func do() error {
    client := client.NewIMDBClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &testPackageName.CreateMovieRequest{
        Title: "title",
        Rating: 1.1,
    }
    _, err := client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
