package ast

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSourceCodeBuilder(t *testing.T) {
	builder := NewSourceCodeBuilder()
	builder.AddExpr(
		&AssignStmt{
			Left: []Expr{
				NewLocalReference("value"),
			},
			Right: []Expr{
				NewCallExpr(
					NewImportedReference(
						"foo",
						"example.io/bar",
					),
					[]Expr{
						NewBasicLit(`"one"`),
						NewBasicLit(`"two"`),
						NewImportedReference(
							"Value",
							"example.io/enum",
						),
						NewImportedReference(
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
	anotherenum "example.io/another/enum"
	bar "example.io/bar"
	enum "example.io/enum"
)

value := bar.foo(
	"one",
	"two",
	enum.Value,
	anotherenum.Collision,
)`,
		snippet,
	)
}
