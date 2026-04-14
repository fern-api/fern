package example

import (
    context "context"

    uuid "github.com/google/uuid"
    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
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
    request := &fern.ListUsersExtendedRequestForOptionalData{
        Cursor: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
    }
    client.Users.ListWithExtendedResultsAndOptionalData(
        context.TODO(),
        request,
    )
}
