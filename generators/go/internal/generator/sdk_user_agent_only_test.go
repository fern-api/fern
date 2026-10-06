package generator

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
)

func emitPlatformHeaders(t *testing.T, userAgent userAgentConfig) string {
	t.Helper()
	var ua ir.UserAgent
	if err := json.Unmarshal([]byte(`{"header":"User-Agent","value":"github.com/acme/test/1.0.0"}`), &ua); err != nil {
		t.Fatalf("failed to build UserAgent: %v", err)
	}
	return emitPlatformHeadersWithIRUserAgent(t, userAgent, &ua)
}

func emitPlatformHeadersWithIRUserAgent(t *testing.T, userAgent userAgentConfig, ua *ir.UserAgent) string {
	t.Helper()
	f := newFileWriter(
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
		false, // legacyNullableAliasPointers
		userAgent,
		UnionVersionUnspecified,
		"",
		nil,
		nil,
		(*coordinator.Client)(nil),
	)
	sdkConfig := &ir.SdkConfig{
		PlatformHeaders: &ir.PlatformHeaders{
			Language:   "X-Fern-Language",
			SdkName:    "X-Fern-SDK-Name",
			SdkVersion: "X-Fern-SDK-Version",
			UserAgent:  ua,
		},
	}
	if err := f.writePlatformHeaders(sdkConfig, &ModuleConfig{Path: "github.com/acme/test"}, "1.0.0"); err != nil {
		t.Fatalf("writePlatformHeaders returned error: %v", err)
	}
	return f.buffer.String()
}

func TestPlatformHeadersDefaultIncludesFernHeaders(t *testing.T) {
	src := emitPlatformHeaders(t, userAgentConfig{})
	for _, want := range []string{`"X-Fern-Language"`, `"X-Fern-SDK-Name"`, `"X-Fern-SDK-Version"`, `"User-Agent"`} {
		if !strings.Contains(src, want) {
			t.Errorf("expected %s in output:\n%s", want, src)
		}
	}
}

func TestPlatformHeadersUserAgentOnly(t *testing.T) {
	for _, cfg := range []userAgentConfig{
		{userAgentOnly: true},
		{userAgentOnly: true, includePlatformHeaders: true},
	} {
		src := emitPlatformHeaders(t, cfg)
		if !strings.Contains(src, `"User-Agent"`) {
			t.Errorf("expected User-Agent in output for %+v:\n%s", cfg, src)
		}
		for _, unwanted := range []string{"X-Fern-Language", "X-Fern-SDK-Name", "X-Fern-SDK-Version"} {
			if strings.Contains(src, unwanted) {
				t.Errorf("unexpected %s in output for %+v:\n%s", unwanted, cfg, src)
			}
		}
		if cfg.includePlatformHeaders && !strings.Contains(src, platformUserAgentFunc+"(") {
			t.Errorf("expected structured User-Agent for %+v:\n%s", cfg, src)
		}
	}
}

func TestPlatformHeadersOmitFernHeadersWinsOverUserAgentOnly(t *testing.T) {
	src := emitPlatformHeaders(t, userAgentConfig{omitFernHeaders: true, userAgentOnly: true})
	if strings.Contains(src, "User-Agent") || strings.Contains(src, "X-Fern-") {
		t.Errorf("expected no platform headers with omitFernHeaders:\n%s", src)
	}
}

func TestPlatformHeadersUserAgentOnlyKeepsDiscreteHeadersWithoutUserAgent(t *testing.T) {
	src := emitPlatformHeadersWithIRUserAgent(t, userAgentConfig{userAgentOnly: true}, nil)
	for _, want := range []string{`"X-Fern-Language"`, `"X-Fern-SDK-Name"`, `"X-Fern-SDK-Version"`} {
		if !strings.Contains(src, want) {
			t.Errorf("expected %s in output:\n%s", want, src)
		}
	}
}
