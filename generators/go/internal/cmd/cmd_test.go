package cmd

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAppendMajorVersionSuffix(t *testing.T) {
	t.Parallel()

	tests := []struct {
		desc        string
		importPath  string
		version     string
		expected    string
		expectedErr bool
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
			// The go command only permits a suffix for v2 and above, so a configured "/v1"
			// is a configuration error. Appending would produce ".../v1/v2" instead.
			desc:        "rejects a configured v1 suffix",
			importPath:  "github.com/acme/acme-go/v1",
			version:     "v2",
			expectedErr: true,
		},
		{
			desc:        "rejects a configured v0 suffix",
			importPath:  "github.com/acme/acme-go/v0",
			version:     "v2",
			expectedErr: true,
		},
		{
			desc:        "rejects a zero-padded suffix",
			importPath:  "github.com/acme/acme-go/v01",
			version:     "v2",
			expectedErr: true,
		},
		{
			desc:        "rejects a non-major version suffix",
			importPath:  "github.com/acme/acme-go/v1.2",
			version:     "v2",
			expectedErr: true,
		},
	}
	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			importPath, err := appendMajorVersionSuffix(test.importPath, test.version)
			if test.expectedErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, test.expected, importPath)
		})
	}
}

func TestMajorVersionSuffix(t *testing.T) {
	t.Parallel()

	tests := []struct {
		importPath  string
		expected    string
		expectedErr bool
	}{
		{importPath: "github.com/plaid/plaid-go/v46", expected: "v46"},
		{importPath: "github.com/plaid/plaid-go", expected: ""},
		{importPath: "github.com/acme/acme-go/v2", expected: "v2"},
		{importPath: "github.com/acme/acme-go/v0", expectedErr: true},
		{importPath: "github.com/acme/acme-go/v01", expectedErr: true},
		{importPath: "github.com/acme/acme-go/v1", expectedErr: true},
	}
	for _, test := range tests {
		t.Run(test.importPath, func(t *testing.T) {
			suffix, err := majorVersionSuffix(test.importPath)
			if test.expectedErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, test.expected, suffix)
		})
	}
}
