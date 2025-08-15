package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    context "context"
    fern "github.com/client-side-params/fern"
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
    client.Service.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Email: "email",
            EmailVerified: fern.Bool(
                true,
            ),
            Username: fern.String(
                "username",
            ),
            Password: fern.String(
                "password",
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
            Connection: "connection",
        },
    )
}
