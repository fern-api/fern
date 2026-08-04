package generator

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
)

// newAppInfoTestWriter builds a bare fileWriter with allowUserAgentAppInfo
// enabled, suitable for exercising the emitted AppInfo helpers.
func newAppInfoTestWriter() *fileWriter {
	return newFileWriter(
		"request_option.go",
		"core",
		"github.com/acme/test",
		false, // whitelabel
		false, // alwaysSendRequiredProperties
		false, // inlinePathParameters
		false, // inlineFileProperties
		false, // useReaderForBytesRequest
		false, // gettersPassByValue
		false, // dedupeUnionBaseProperties
		true,  // serverURLVariables
		false, // exportAllRequestsAtRoot
		false, // omitEmptyRequestWrappers
		userAgentConfig{allowUserAgentAppInfo: true},
		UnionVersionUnspecified,
		"",
		nil,
		nil,
		(*coordinator.Client)(nil),
	)
}

// emitAppInfoSource returns the emitted AppInfo type + appender helper source.
func emitAppInfoSource(t *testing.T) string {
	t.Helper()
	f := newAppInfoTestWriter()
	f.writeAppInfoType()
	f.writeAppendAppInfoFunc()
	return f.buffer.String()
}

// TestAppInfoEmittedSourceStructure asserts the emitted source has the expected,
// sanitizing shape: token/comment encoders, trim-before-blank-check ordering, and
// blank/nil handling.
func TestAppInfoEmittedSourceStructure(t *testing.T) {
	src := emitAppInfoSource(t)
	for _, want := range []string{
		"type AppInfo struct {",
		"func appendAppInfoToUserAgent(userAgent string, appInfo *AppInfo) string {",
		"appendAppInfoToUserAgentEncodeToken",
		"appendAppInfoToUserAgentEncodeComment",
		"appendAppInfoToUserAgentPercentEncode",
		// Trim happens before the blank check and before encoding.
		"appendAppInfoToUserAgentEncodeToken(strings.TrimSpace(appInfo.Name))",
		`if name == "" {`,
		"if appInfo == nil {",
		// Comment delimiters and control chars are escaped.
		`if r == '(' || r == ')' || r == '\\' || r < 0x20 || r == 0x7F {`,
	} {
		if !strings.Contains(src, want) {
			t.Errorf("emitted AppInfo source missing %q\n---\n%s", want, src)
		}
	}
}

// TestAppInfoTypeEmittedRegardlessOfVersionAndPlatformHeaders proves the
// previously-broken gating: the AppInfo type must be emitted whenever
// emitsAppInfo() is true, even when no SDK version is available (local /
// downloadFiles generation) and the IR declares no platform headers. Its
// consumers (the AppInfo field, AppInfoOption, and option.WithUserAgentAppInfo)
// are gated solely on emitsAppInfo(); if the type were skipped in this path the
// generated core package would reference an undefined core.AppInfo and fail to
// compile.
func TestAppInfoTypeEmittedRegardlessOfVersionAndPlatformHeaders(t *testing.T) {
	f := newAppInfoTestWriter()

	// Empty auth + no headers exercises the versionless code path, and a nil
	// PlatformHeaders + empty sdkVersion is precisely the previously-broken case.
	err := f.WriteRequestOptionsDefinition(
		&ir.ApiAuth{},   // no schemes
		nil,             // headers
		nil,             // idempotencyHeaders
		&ir.SdkConfig{}, // PlatformHeaders == nil
		&ModuleConfig{}, // moduleConfig
		"",              // sdkVersion (empty -> platform headers early-return)
		nil,             // environmentsConfig
		nil,             // inferredParams
	)
	if err != nil {
		t.Fatalf("WriteRequestOptionsDefinition returned error: %v", err)
	}

	src := f.buffer.String()

	// The type must be present exactly once (no double-emission).
	const typeDecl = "type AppInfo struct {"
	if count := strings.Count(src, typeDecl); count != 1 {
		t.Fatalf("expected %q emitted exactly once, got %d:\n---\n%s", typeDecl, count, src)
	}
	// Its consumer (the RequestOptions field) must also be present, confirming
	// the type and its consumers are emitted together.
	if !strings.Contains(src, "AppInfo *AppInfo") {
		t.Errorf("expected RequestOptions to declare the AppInfo field:\n---\n%s", src)
	}
}

// TestAppInfoTypeNotEmittedWhenFeatureDisabled guards against regressions: with
// the appInfo feature off, neither the type nor its field should be emitted, so
// flag-off output stays byte-identical.
func TestAppInfoTypeNotEmittedWhenFeatureDisabled(t *testing.T) {
	f := newFileWriter(
		"request_option.go",
		"core",
		"github.com/acme/test",
		false,             // whitelabel
		false,             // alwaysSendRequiredProperties
		false,             // inlinePathParameters
		false,             // inlineFileProperties
		false,             // useReaderForBytesRequest
		false,             // gettersPassByValue
		false,             // dedupeUnionBaseProperties
		true,              // serverURLVariables
		false,             // exportAllRequestsAtRoot
		false,             // omitEmptyRequestWrappers
		userAgentConfig{}, // allowUserAgentAppInfo disabled
		UnionVersionUnspecified,
		"",
		nil,
		nil,
		(*coordinator.Client)(nil),
	)

	err := f.WriteRequestOptionsDefinition(
		&ir.ApiAuth{},
		nil,
		nil,
		&ir.SdkConfig{},
		&ModuleConfig{},
		"",
		nil,
		nil,
	)
	if err != nil {
		t.Fatalf("WriteRequestOptionsDefinition returned error: %v", err)
	}

	src := f.buffer.String()
	if strings.Contains(src, "type AppInfo struct {") {
		t.Errorf("AppInfo type should not be emitted when feature disabled:\n---\n%s", src)
	}
}

// TestAppInfoRuntimeBehavior compiles and runs the emitted helper against a table
// of inputs, asserting the sanitized User-Agent it produces. This exercises the
// exact code SDK consumers receive.
func TestAppInfoRuntimeBehavior(t *testing.T) {
	if _, err := exec.LookPath("go"); err != nil {
		t.Skip("go toolchain not available; skipping compile-and-run test")
	}

	helper := emitAppInfoSource(t)

	// Build a self-contained program: the emitted helper plus a harness that
	// prints one result per line for a fixed set of cases.
	program := `package main

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

var _ = fmt.Sprintf
var _ = strings.TrimSpace
var _ = utf8.UTFMax
` + helper + `

func run(name, version, comment string, hasAppInfo bool) string {
	var info *AppInfo
	if hasAppInfo {
		info = &AppInfo{Name: name, Version: version, Comment: comment}
	}
	return appendAppInfoToUserAgent("base/1.0", info)
}

func main() {
	fmt.Println(run("", "", "", false))                                  // 0: nil appInfo
	fmt.Println(run("app", "3.1.0", "+https://x.example", true))         // 1: full
	fmt.Println(run("app", "", "", true))                                // 2: name only
	fmt.Println(run("app", "2.0", "", true))                             // 3: name+version
	fmt.Println(run("   ", "", "", true))                                // 4: whitespace-only name -> unchanged
	fmt.Println(run("app", "  ", "", true))                              // 5: whitespace-only version dropped
	fmt.Println(run(" app ", " 1.0 ", " hi ", true))                     // 6: trimmed before encode
	fmt.Println(run("a b", "1 0", "", true))                             // 7: spaces percent-encoded in token
	fmt.Println(run("app", "1.0", "a\r\nb", true))                       // 8: CRLF injection escaped in comment
	fmt.Println(run("ap\r\np", "1.0", "", true))                         // 9: CRLF injection escaped in token
	fmt.Println(run("app", "1.0", "a(b)c\\d", true))                     // 10: paren/backslash escaped in comment
	fmt.Println(run("app", "1.0", "control\tx", true))                   // 11: control char escaped in comment
}
`

	dir := t.TempDir()
	src := filepath.Join(dir, "main.go")
	if err := os.WriteFile(src, []byte(program), 0o644); err != nil {
		t.Fatalf("write program: %v", err)
	}

	cmd := exec.Command("go", "run", src)
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("go run failed: %v\n%s\n---program---\n%s", err, out, program)
	}

	got := strings.Split(strings.TrimRight(string(out), "\n"), "\n")
	want := []string{
		"base/1.0", // 0
		"base/1.0 app/3.1.0 (+https://x.example)", // 1
		"base/1.0 app",                     // 2
		"base/1.0 app/2.0",                 // 3
		"base/1.0",                         // 4: whitespace-only name -> unchanged (no junk token)
		"base/1.0 app",                     // 5: whitespace-only version dropped
		"base/1.0 app/1.0 (hi)",            // 6: trimmed, no %20 junk
		"base/1.0 a%20b/1%200",             // 7: spaces percent-encoded
		"base/1.0 app/1.0 (a%0D%0Ab)",      // 8: CRLF escaped in comment
		"base/1.0 ap%0D%0Ap/1.0",           // 9: CRLF escaped in token
		"base/1.0 app/1.0 (a%28b%29c%5Cd)", // 10: ( ) \ escaped
		"base/1.0 app/1.0 (control%09x)",   // 11: tab escaped
	}
	if len(got) != len(want) {
		t.Fatalf("expected %d output lines, got %d:\n%s", len(want), len(got), string(out))
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("case %d:\n  got  %q\n  want %q", i, got[i], want[i])
		}
	}
}
