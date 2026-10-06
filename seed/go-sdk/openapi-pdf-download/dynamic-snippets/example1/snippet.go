package example

import (
    context "context"

    fern "github.com/openapi-pdf-download/fern"
    client "github.com/openapi-pdf-download/fern/client"
    option "github.com/openapi-pdf-download/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AssetReportPdfGetRequest{
        AssetReportToken: "asset_report_token",
    }
    client.AssetReport.GetPdf(
        context.TODO(),
        request,
    )
}
