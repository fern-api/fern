package example

import (
    context "context"

    uuid "github.com/google/uuid"
    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    inlineusers "github.com/pagination/fern/inlineusers"
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
    request := &inlineusers.ListUsersExtendedRequestForOptionalData{
        Cursor: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
    }
    client.InlineUsers.InlineUsers.ListWithExtendedResultsAndOptionalData(
        context.TODO(),
        request,
    )
}
