package cmd

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMaybeAppendVersionSuffix(t *testing.T) {
	t.Parallel()

	tests := []struct {
		desc       string
		importPath string
		version    string
		expected   string
	}{
		{
			desc:       "appends the suffix",
			importPath: "github.com/acme/acme-go",
			version:    "v2",
			expected:   "github.com/acme/acme-go/v2",
		},
		{
			desc:       "does not append the suffix twice",
			importPath: "github.com/acme/acme-go/v2",
			version:    "v2",
			expected:   "github.com/acme/acme-go/v2",
		},
		{
			desc:       "preserves a configured suffix that differs from the release version",
			importPath: "github.com/acme/acme-go/v46",
			version:    "v34",
			expected:   "github.com/acme/acme-go/v46",
		},
		{
			desc:       "leaves a configured v1 suffix alone rather than doubling it",
			importPath: "github.com/acme/acme-go/v1",
			version:    "v2",
			expected:   "github.com/acme/acme-go/v1",
		},
		{
			desc:       "appends the suffix when the path ends in v0",
			importPath: "github.com/acme/acme-go/v0",
			version:    "v2",
			expected:   "github.com/acme/acme-go/v0/v2",
		},
		{
			desc:       "appends the suffix when the path ends in a zero-padded version",
			importPath: "github.com/acme/acme-go/v01",
			version:    "v2",
			expected:   "github.com/acme/acme-go/v01/v2",
		},
	}
	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			assert.Equal(t, test.expected, maybeAppendVersionSuffix(test.importPath, test.version))
		})
	}
}
