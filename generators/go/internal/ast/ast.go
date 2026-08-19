package ast

import "fmt"

// Expr is a general expression, which could be a type, function declaration,
// code snippet, etc.
type Expr interface {
	isExpr()

	WriteTo(*Writer)
}

// Block represents multiple expressions in a newline-delimited block of code, e.g.
//
//	foo := NewFoo()
//	value := foo.Bar(
//	  "one",
//	  "two",
//	)
type Block struct {
	Exprs []Expr
}

func NewBlock(exprs ...Expr) *Block {
	return &Block{
		Exprs: exprs,
	}
}

func (b *Block) isExpr() {}

func (b *Block) WriteTo(w *Writer) {
	for _, expr := range b.Exprs {
		w.WriteExpr(expr)
		w.WriteLine()
	}
}

// AssignStmt is an assignment or a short variable declaration, e.g.
//
//	value := foo.Bar(
//	  "one",
//	  "two",
//	)
type AssignStmt struct {
	Left  []Expr
	Right []Expr
}

func NewAssignStmt(left, right []Expr) *AssignStmt {
	return &AssignStmt{
		Left:  left,
		Right: right,
	}
}

func (a *AssignStmt) isExpr() {}

func (a *AssignStmt) WriteTo(w *Writer) {
	for i, elem := range a.Left {
		if i > 0 {
			w.Write(", ")
		}
		w.WriteExpr(elem)
	}
	w.Write(" := ")
	for i, elem := range a.Right {
		if i > 0 {
			w.Write(", ")
		}
		w.WriteExpr(elem)
	}
}

// CallExpr is a call expression node, e.g.
//
//	foo.Bar(
//	  "one",
//	  "two",
//	)
type CallExpr struct {
	FunctionName Reference
	Parameters   []Expr
}

func NewCallExpr(functionName Reference, parameters []Expr) *CallExpr {
	return &CallExpr{
		FunctionName: functionName,
		Parameters:   parameters,
	}
}

func (c *CallExpr) isExpr() {}

func (c *CallExpr) WriteTo(w *Writer) {
	w.WriteExpr(c.FunctionName)
	if len(c.Parameters) == 0 {
		w.Write("()")
		return
	}

	w.WriteLine("(")
	for _, param := range c.Parameters {
		w.WriteExpr(param)
		w.WriteLine(",")
	}
	w.Write(")")
}

// Reference is either a local or imported reference, such as a constant,
// type, variable, function, etc.
type Reference interface {
	Expr

	isReference()
}

// MapType is a simple map type AST node, which does not include the
// map's values.
type MapType struct {
	Key   Expr
	Value Expr
}

func NewMapType(key Reference, value Reference) *MapType {
	return &MapType{
		Key:   key,
		Value: value,
	}
}

func (m *MapType) isExpr() {}

func (m *MapType) WriteTo(w *Writer) {
	w.Write("map[")
	w.WriteExpr(m.Key)
	w.Write("]")
	w.WriteExpr(m.Value)
}

// ArrayType is a simple array type AST node, which does not include the
// array's values.
type ArrayType struct {
	Expr Expr
}

func NewArrayType(expr Expr) *ArrayType {
	return &ArrayType{
		Expr: expr,
	}
}

func (a *ArrayType) isExpr() {}

func (a *ArrayType) WriteTo(w *Writer) {
	w.Write("[]")
	w.WriteExpr(a.Expr)
}

// ImportedReference is a named language entity imported from another package,
// such as a constant, type, variable, function, etc.
//
// Unlike the go/ast package, this also includes literal
// values (e.g. "foo").
type ImportedReference struct {
	Name       string
	ImportPath string
}

func NewImportedReference(name string, importPath string) *ImportedReference {
	return &ImportedReference{
		Name:       name,
		ImportPath: importPath,
	}
}

func (i *ImportedReference) isExpr()      {}
func (i *ImportedReference) isReference() {}

func (i *ImportedReference) WriteTo(w *Writer) {
	alias := w.scope.AddImport(i.ImportPath)
	w.Write(fmt.Sprintf("%s.%s", alias, i.Name))
}

// LocalReference is a named language entity referenced within the same
// package such as a constant, type, variable, function, etc.
type LocalReference struct {
	Name string
}

func NewLocalReference(name string) *LocalReference {
	return &LocalReference{
		Name: name,
	}
}

func (l *LocalReference) isExpr()      {}
func (l *LocalReference) isReference() {}

func (l LocalReference) WriteTo(w *Writer) {
	w.Write(l.Name)
}

// Optional is an optional type, such that it needs a pointer in its declaration.
type Optional struct {
	Expr Expr
}

func NewOptional(expr Expr) *Optional {
	return &Optional{
		Expr: expr,
	}
}

func (o *Optional) isExpr() {}

func (o *Optional) WriteTo(w *Writer) {
	w.Write("*")
	w.WriteExpr(o.Expr)
}

// Field is an individual struct field.
type Field struct {
	Key   string
	Value Expr
}

func NewField(key string, value Expr) Field {
	return Field{
		Key:   key,
		Value: value,
	}
}

func (f *Field) isExpr() {}

func (f *Field) WriteTo(w *Writer) {
	w.Write(f.Key)
	w.Write(": ")
	w.WriteExpr(f.Value)
}

// StructType is an individual struct instance.
type StructType struct {
	Name   Reference
	Fields []*Field
}

func NewStructType(name Reference, fields []*Field) *StructType {
	return &StructType{
		Name:   name,
		Fields: fields,
	}
}

func (s *StructType) isExpr() {}

func (s *StructType) WriteTo(w *Writer) {
	w.Write("&")
	w.WriteExpr(s.Name)
	w.WriteLine("{")
	for _, field := range s.Fields {
		w.WriteExpr(field)
		w.WriteLine(",")
	}
	w.Write("}")
}

type ArrayLit struct {
	Type   *ArrayType
	Values []Expr
}

func (a *ArrayLit) isExpr() {}

func (a *ArrayLit) WriteTo(w *Writer) {
	if len(a.Values) == 0 {
		w.Write("nil")
		return
	}

	w.WriteExpr(a.Type)
	w.WriteLine("{")
	for _, value := range a.Values {
		w.WriteExpr(value)
		w.WriteLine(",")
	}
	w.Write("}")
}

type MapLit struct {
	Type   *MapType
	Keys   []Expr
	Values []Expr
}

func (m *MapLit) isExpr() {}

func (m *MapLit) WriteTo(w *Writer) {
	if len(m.Keys) == 0 {
		w.Write("nil")
		return
	}
	w.WriteExpr(m.Type)
	w.WriteLine("{")
	for i, key := range m.Keys {
		w.WriteExpr(key)
		w.Write(": ")
		w.WriteExpr(m.Values[i])
		w.WriteLine(",")
	}
	w.Write("}")
}

// BasicLit is a basic literal represented as a string value
// (e.g. 42, "foo", false, etc).
type BasicLit struct {
	Value string
}

func NewBasicLit(value string) *BasicLit {
	return &BasicLit{
		Value: value,
	}
}

func (b *BasicLit) isExpr() {}

func (b *BasicLit) WriteTo(w *Writer) {
	w.Write(b.Value)
}
