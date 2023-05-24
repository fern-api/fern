package api

type Union struct {
	Foo              *Foo
	Bar              *Bar
	Baz              *Baz
	String           string
	IntegerOptional  *int
	StringBooleanMap map[string]bool
	StringList       []string
	StringListList   [][]string
	DoubleSet        []float64
}
