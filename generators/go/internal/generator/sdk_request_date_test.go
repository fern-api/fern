package generator

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// newRequestTypeEndpointForTest builds an IR endpoint whose wrapped request
// has an inlined body with the given properties.
func newRequestTypeEndpointForTest(wrapperName string, properties []*ir.InlinedRequestBodyProperty) *ir.HttpEndpoint {
	return newRequestTypeEndpointWithExtraPropertiesForTest(wrapperName, properties, false)
}

func newRequestTypeEndpointWithExtraPropertiesForTest(wrapperName string, properties []*ir.InlinedRequestBodyProperty, extraProperties bool) *ir.HttpEndpoint {
	name := func(s string) *common.Name {
		return &common.Name{
			OriginalName: s,
			CamelCase:    &common.SafeAndUnsafeString{UnsafeName: s, SafeName: s},
			PascalCase:   &common.SafeAndUnsafeString{UnsafeName: s, SafeName: s},
		}
	}
	return &ir.HttpEndpoint{
		Name: ir.EndpointName(name("get")),
		SdkRequest: &ir.SdkRequest{
			Shape: &ir.SdkRequestShape{
				Type: "wrapper",
				Wrapper: &ir.SdkRequestWrapper{
					WrapperName: name(wrapperName),
					BodyKey:     name("Body"),
				},
			},
		},
		RequestBody: &ir.HttpRequestBody{
			Type: "inlinedRequestBody",
			InlinedRequestBody: &ir.InlinedRequestBody{
				Name:            name(wrapperName),
				Properties:      properties,
				ExtraProperties: extraProperties,
			},
		},
	}
}

func newInlinedRequestBodyPropertyForTest(wireValue string, fieldName string, valueType *ir.TypeReference) *ir.InlinedRequestBodyProperty {
	return &ir.InlinedRequestBodyProperty{
		Name: &common.NameAndWireValue{
			WireValue: wireValue,
			Name: &common.Name{
				OriginalName: wireValue,
				CamelCase:    &common.SafeAndUnsafeString{UnsafeName: fieldName, SafeName: fieldName},
				PascalCase:   &common.SafeAndUnsafeString{UnsafeName: fieldName, SafeName: fieldName},
			},
		},
		ValueType: valueType,
	}
}

// requestTypeSourceForTest emits a formatted Go source file (in package main)
// declaring the given endpoint's wrapped request type.
func requestTypeSourceForTest(t *testing.T, endpoint *ir.HttpEndpoint) string {
	t.Helper()
	f := newHeaderTestWriter(nil)
	if err := f.WriteRequestType(&common.FernFilepath{}, endpoint, nil, nil, false, false); err != nil {
		t.Fatalf("WriteRequestType returned error: %v", err)
	}
	const header = `package main

import (
	json "encoding/json"
	fmt "fmt"
	big "math/big"
	time "time"

	internal "github.com/acme/test/internal"
)

`
	formatted, err := removeUnusedImports("requests.go", append([]byte(header), f.buffer.Bytes()...))
	if err != nil {
		t.Fatalf("removeUnusedImports returned error: %v", err)
	}
	return string(formatted)
}

var (
	dateTypeForTest             = newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1Date)
	dateTimeTypeForTest         = newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1DateTime)
	optionalDateTypeForTest     = newOptionalTypeReferenceForTest(dateTypeForTest)
	optionalDateTimeTypeForTest = newOptionalTypeReferenceForTest(dateTimeTypeForTest)
	stringTypeForTest           = newPrimitiveTypeReferenceForTest(common.PrimitiveTypeV1String)
)

// TestRequestTypeUnmarshalJSONOverridesDates asserts that the emitted UnmarshalJSON
// decodes date and date-time properties through the same internal.Date and
// internal.DateTime types that MarshalJSON encodes them with.
func TestRequestTypeUnmarshalJSONOverridesDates(t *testing.T) {
	src := requestTypeSourceForTest(
		t,
		newRequestTypeEndpointForTest(
			"TransactionsGetRequest",
			[]*ir.InlinedRequestBodyProperty{
				newInlinedRequestBodyPropertyForTest("start_date", "StartDate", dateTypeForTest),
				newInlinedRequestBodyPropertyForTest("end_date", "EndDate", optionalDateTypeForTest),
				newInlinedRequestBodyPropertyForTest("created_at", "CreatedAt", dateTimeTypeForTest),
				newInlinedRequestBodyPropertyForTest("updated_at", "UpdatedAt", optionalDateTimeTypeForTest),
			},
		),
	)
	for _, want := range []string{
		`func (t *TransactionsGetRequest) UnmarshalJSON(data []byte) error {
			type embed TransactionsGetRequest
			var body = struct {
				embed
				StartDate *internal.Date     ` + "`" + `json:"start_date"` + "`" + `
				EndDate   *internal.Date     ` + "`" + `json:"end_date,omitempty"` + "`" + `
				CreatedAt *internal.DateTime ` + "`" + `json:"created_at"` + "`" + `
				UpdatedAt *internal.DateTime ` + "`" + `json:"updated_at,omitempty"` + "`" + `
			}{
				embed: embed(*t),
			}
			if err := json.Unmarshal(data, &body); err != nil {
				return err
			}
			*t = TransactionsGetRequest(body.embed)
			t.StartDate = body.StartDate.Time()
			t.EndDate = body.EndDate.TimePtr()
			t.CreatedAt = body.CreatedAt.Time()
			t.UpdatedAt = body.UpdatedAt.TimePtr()
			return nil
		}`,
	} {
		if !strings.Contains(stripSpace(src), stripSpace(want)) {
			t.Errorf("emitted source must contain:\n%s\nbut does not:\n%s", want, src)
		}
	}
}

// TestRequestTypeUnmarshalJSONWithoutDatesIsUnchanged asserts that request types
// without any date properties keep the simple type-alias unmarshaler.
func TestRequestTypeUnmarshalJSONWithoutDatesIsUnchanged(t *testing.T) {
	src := requestTypeSourceForTest(
		t,
		newRequestTypeEndpointForTest(
			"UpdateNameRequest",
			[]*ir.InlinedRequestBodyProperty{
				newInlinedRequestBodyPropertyForTest("name", "Name", stringTypeForTest),
			},
		),
	)
	want := `func (u *UpdateNameRequest) UnmarshalJSON(data []byte) error {
		type unmarshaler UpdateNameRequest
		var body unmarshaler
		if err := json.Unmarshal(data, &body); err != nil {
			return err
		}
		*u = UpdateNameRequest(body)
		return nil
	}`
	if !strings.Contains(stripSpace(src), stripSpace(want)) {
		t.Errorf("emitted source must contain:\n%s\nbut does not:\n%s", want, src)
	}
	if strings.Contains(src, "type embed UpdateNameRequest\n\tvar body") {
		t.Errorf("request types without dates must not use the embed unmarshaler:\n%s", src)
	}
}

// TestRequestTypeDateRoundTrip compiles the emitted request type against the
// runtime internal package and asserts that json.Unmarshal accepts exactly the
// JSON that MarshalJSON produces, for both date and date-time properties.
func TestRequestTypeDateRoundTrip(t *testing.T) {
	if _, err := exec.LookPath("go"); err != nil {
		t.Skip("go binary not found in PATH")
	}
	src := requestTypeSourceForTest(
		t,
		newRequestTypeEndpointForTest(
			"TransactionsGetRequest",
			[]*ir.InlinedRequestBodyProperty{
				newInlinedRequestBodyPropertyForTest("account_id", "AccountId", stringTypeForTest),
				newInlinedRequestBodyPropertyForTest("start_date", "StartDate", dateTypeForTest),
				newInlinedRequestBodyPropertyForTest("end_date", "EndDate", optionalDateTypeForTest),
				newInlinedRequestBodyPropertyForTest("created_at", "CreatedAt", dateTimeTypeForTest),
				newInlinedRequestBodyPropertyForTest("updated_at", "UpdatedAt", optionalDateTimeTypeForTest),
			},
		),
	)

	extraSrc := requestTypeSourceForTest(
		t,
		newRequestTypeEndpointWithExtraPropertiesForTest(
			"TransactionsSearchRequest",
			[]*ir.InlinedRequestBodyProperty{
				newInlinedRequestBodyPropertyForTest("start_date", "StartDate", dateTypeForTest),
				newInlinedRequestBodyPropertyForTest("end_date", "EndDate", optionalDateTypeForTest),
			},
			true,
		),
	)

	const mainSource = `package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

func main() {
	var search TransactionsSearchRequest
	if err := json.Unmarshal([]byte(` + "`" + `{"start_date":"2026-01-02","end_date":"2026-01-03","unknown":"x"}` + "`" + `), &search); err != nil {
		fmt.Println("extra-properties unmarshal:", err)
		os.Exit(1)
	}
	if got := search.StartDate.Format("2006-01-02"); got != "2026-01-02" || search.EndDate == nil {
		fmt.Printf("extra-properties dates: %+v\n", search)
		os.Exit(1)
	}
	if extra := search.ExtraProperties; len(extra) != 1 || extra["unknown"] != "x" {
		fmt.Printf("date keys leaked into extra properties: %v\n", extra)
		os.Exit(1)
	}

	var req TransactionsGetRequest
	if err := json.Unmarshal([]byte(` + "`" + `{"start_date":"2026-01-02","created_at":"2026-01-02T03:04:05.123456789Z"}` + "`" + `), &req); err != nil {
		fmt.Println("date-only unmarshal:", err)
		os.Exit(1)
	}
	if got := req.StartDate.Format("2006-01-02"); got != "2026-01-02" {
		fmt.Println("unexpected start_date:", got)
		os.Exit(1)
	}
	if req.CreatedAt.Nanosecond() != 123456789 {
		fmt.Println("lost fractional seconds:", req.CreatedAt)
		os.Exit(1)
	}
	if req.EndDate != nil || req.UpdatedAt != nil {
		fmt.Println("optional fields should be nil")
		os.Exit(1)
	}

	endDate := time.Date(2026, time.March, 4, 0, 0, 0, 0, time.UTC)
	updatedAt := time.Date(2026, time.March, 4, 5, 6, 7, 890, time.UTC)
	original := &TransactionsGetRequest{
		AccountId: "acc_123",
		StartDate: time.Date(2026, time.January, 2, 0, 0, 0, 0, time.UTC),
		EndDate:   &endDate,
		CreatedAt: time.Date(2026, time.January, 2, 3, 4, 5, 6, time.UTC),
		UpdatedAt: &updatedAt,
	}
	data, err := json.Marshal(original)
	if err != nil {
		fmt.Println("marshal:", err)
		os.Exit(1)
	}
	var decoded TransactionsGetRequest
	if err := json.Unmarshal(data, &decoded); err != nil {
		fmt.Println("round-trip unmarshal:", err, string(data))
		os.Exit(1)
	}
	roundTripped, err := json.Marshal(&decoded)
	if err != nil {
		fmt.Println("re-marshal:", err)
		os.Exit(1)
	}
	if string(data) != string(roundTripped) {
		fmt.Printf("round-trip mismatch:\n%s\n%s\n", data, roundTripped)
		os.Exit(1)
	}
	if !decoded.StartDate.Equal(original.StartDate) || !decoded.EndDate.Equal(*original.EndDate) ||
		!decoded.CreatedAt.Equal(original.CreatedAt) || !decoded.UpdatedAt.Equal(*original.UpdatedAt) ||
		decoded.AccountId != original.AccountId {
		fmt.Printf("round-trip values differ:\n%+v\n%+v\n", original, decoded)
		os.Exit(1)
	}
	fmt.Print(string(data))
}
`
	dir := t.TempDir()
	files := map[string]string{
		"go.mod":               "module github.com/acme/test\n\ngo 1.18\n",
		"requests.go":          src,
		"requests_extra.go":    extraSrc,
		"internal/extra.go":    extraPropertiesFile,
		"main.go":              mainSource,
		"internal/time.go":     timeFile,
		"internal/explicit.go": explicitFieldsFile,
	}
	for name, content := range files {
		path := filepath.Join(dir, name)
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	cmd := exec.Command("go", "run", ".")
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "GOFLAGS=-mod=mod", "GO111MODULE=on")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("round-trip program failed: %v\n%s\n\ngenerated source:\n%s", err, output, src)
	}
	const wantJSON = `{"account_id":"acc_123","start_date":"2026-01-02","end_date":"2026-03-04","created_at":"2026-01-02T03:04:05.000000006Z","updated_at":"2026-03-04T05:06:07.00000089Z"}`
	if got := string(output); got != wantJSON {
		t.Errorf("unexpected marshaled JSON:\n got: %s\nwant: %s", got, wantJSON)
	}
}
