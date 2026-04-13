package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.DeserializationTestRequest{
        RequiredString: "requiredString",
        NullableEnum: fern.UserRoleAdmin,
        NullableUnion: &fern.NotificationMethod{
            NotificationMethodZero: &fern.NotificationMethodZero{
                EmailAddress: "emailAddress",
                Subject: "subject",
                Type: fern.NotificationMethodZeroTypeEmail,
            },
        },
        NullableObject: &fern.Address{
            Street: "street",
            ZipCode: "zipCode",
        },
    }
    client.Nullableoptional.Testdeserialization(
        context.TODO(),
        request,
    )
}
