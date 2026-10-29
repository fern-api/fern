package example

import (
    context "context"

    fern "github.com/property-access/fern"
    client "github.com/property-access/fern/client"
    option "github.com/property-access/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.User{
        ID: "id",
        Email: "email",
        Password: "password",
        Profile: &fern.UserProfile{
            Name: "name",
            Verification: &fern.UserProfileVerification{
                Verified: "verified",
            },
            Ssn: "ssn",
        },
    }
    _, err := client.CreateUser(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
