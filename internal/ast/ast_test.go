package ast

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSourceCodeBuilder(t *testing.T) {
	builder := NewSourceCodeBuilder()
	builder.AddExpr(
		AssignStmt{
			Left: []Expr{
				NewLocalObject("value"),
			},
			Right: []Expr{
				NewCallExpr(
					NewImportedObject(
						"foo",
						"example.io/bar",
					),
					[]Expr{
						NewLocalObject(`"one"`),
						NewLocalObject(`"two"`),
						NewImportedObject(
							"Value",
							"example.io/enum",
						),
						NewImportedObject(
							"Collision",
							"example.io/another/enum",
						),
					},
				),
			},
		},
	)
	snippet, err := builder.BuildSnippet()
	require.NoError(t, err)
	assert.Equal(
		t,
		`import (
	bar "example.io/bar"
	enum "example.io/enum"
	anotherenum "example.io/another/enum"
)

value := bar.foo(
	"one",
	"two",
	enum.Value,
	anotherenum.Collision,
)
`,
		snippet,
	)
}
