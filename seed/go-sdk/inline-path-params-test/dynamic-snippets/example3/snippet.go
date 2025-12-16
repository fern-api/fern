package example

import (
    client "github.com/inline-path-params-test/fern/client"
    option "github.com/inline-path-params-test/fern/option"
    fern "github.com/inline-path-params-test/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUserProfileRequest{
        UserId: "user_id",
        IncludeDetails: fern.Bool(
            true,
        ),
    }
    client.Users.GetUserProfile(
        context.TODO(),
        request,
    )
}
