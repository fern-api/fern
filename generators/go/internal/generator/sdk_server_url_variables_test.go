package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

// serverURLVariable builds an IR server URL variable with the given id/name.
func newServerVariableForTest(id string) *common.ServerVariable {
	return &common.ServerVariable{
		Id: id,
		Name: &common.Name{
			OriginalName: id,
			CamelCase:    &common.SafeAndUnsafeString{UnsafeName: id, SafeName: id},
			PascalCase:   &common.SafeAndUnsafeString{UnsafeName: "Region", SafeName: "Region"},
		},
	}
}

// singleBaseURLEnvironmentsWithVariable returns an EnvironmentsConfig whose sole
// single-base-URL environment declares one server URL variable.
func singleBaseURLEnvironmentsWithVariable() *common.EnvironmentsConfig {
	return &common.EnvironmentsConfig{
		Environments: &common.Environments{
			SingleBaseUrl: &common.SingleBaseUrlEnvironments{
				Environments: []*common.SingleBaseUrlEnvironment{
					{
						Id:  "production",
						Url: "https://{region}.example.com",
						UrlVariables: []*common.ServerVariable{
							newServerVariableForTest("region"),
						},
					},
				},
			},
		},
	}
}

func TestServerURLVariablesFromConfig(t *testing.T) {
	environmentsConfig := singleBaseURLEnvironmentsWithVariable()

	t.Run("returns declared variables when the serverUrlVariables flag is enabled (default)", func(t *testing.T) {
		variables := serverURLVariablesFromConfig(true, environmentsConfig)
		if len(variables) != 1 {
			t.Fatalf("expected 1 server URL variable, got %d", len(variables))
		}
		if got := variables[0].optionName; got != "Region" {
			t.Fatalf("expected option name %q, got %q", "Region", got)
		}
	})

	t.Run("suppresses all variables when the serverUrlVariables flag is disabled", func(t *testing.T) {
		variables := serverURLVariablesFromConfig(false, environmentsConfig)
		if len(variables) != 0 {
			t.Fatalf("expected no server URL variables when the flag is disabled, got %d", len(variables))
		}
	})
}
