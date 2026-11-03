package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.UpdateUserRequest{
        Email: fern.String(
            "email",
        ),
        EmailVerified: fern.Bool(
            true,
        ),
        Username: fern.String(
            "username",
        ),
        PhoneNumber: fern.String(
            "phone_number",
        ),
        PhoneVerified: fern.Bool(
            true,
        ),
        UserMetadata: map[string]any{
            "user_metadata": map[string]any{
                "key": "value",
            },
        },
        AppMetadata: map[string]any{
            "app_metadata": map[string]any{
                "key": "value",
            },
        },
        Password: fern.String(
            "password",
        ),
        Blocked: fern.Bool(
            true,
        ),
    }
    _, err := client.Service.UpdateUser(
        context.TODO(),
        "userId",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
