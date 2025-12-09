package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
    fern "github.com/exhaustive/fern"
    uuid "github.com/google/uuid"
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
    request := &types.ObjectWithOptionalField{
        FieldString: fern.String(
            "string",
        ),
        Integer: fern.Int(
            1,
        ),
        Long: fern.Int64(
            1000000,
        ),
        Double: fern.Float64(
            1.1,
        ),
        Bool: fern.Bool(
            true,
        ),
        Datetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Date: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        Uuid: fern.UUID(
            uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
        ),
        Base64: []byte("SGVsbG8gd29ybGQh"),
        List: []string{
            "list",
            "list",
        },
        Set: []string{
            "set",
        },
        Map: map[int]string{
            1: "map",
        },
        Bigint: fern.String(
            "1000000",
        ),
    }
    client.Endpoints.Object.GetAndReturnWithOptionalField(
        context.TODO(),
        request,
    )
}
