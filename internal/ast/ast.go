package ast

import "fmt"

// Expr is a general expression, which could be a type, function declaration,
// code snippet, etc.
type Expr interface {
	isExpr()

	WriteTo(*Writer)
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

func NewAssignStmt(left, right []Expr) AssignStmt {
	return AssignStmt{
		Left:  left,
		Right: right,
	}
}

func (a AssignStmt) isExpr() {}

func (a AssignStmt) WriteTo(w *Writer) {
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
	FunctionName Object
	Parameters   []Expr
}

func NewCallExpr(functionName Object, parameters []Expr) CallExpr {
	return CallExpr{
		FunctionName: functionName,
		Parameters:   parameters,
	}
}

func (c CallExpr) isExpr() {}

func (c CallExpr) WriteTo(w *Writer) {
	w.WriteExpr(c.FunctionName)
	if len(c.Parameters) == 0 {
		w.Write("()")
		return
	}

	if len(c.Parameters) == 1 {
		// A single parameter can be written in one line, e.g. acme.Call("one")
		w.Write("(")
		for _, param := range c.Parameters {
			w.WriteExpr(param)
		}
		w.Write(")")
		return
	}

	w.WriteLine("(")
	for _, param := range c.Parameters {
		w.WriteExpr(param)
		w.WriteLine(",")
	}
	w.Write(")")
}

// Object is either a local or imported object, such as a constant,
// type, variable, function, etc.
type Object interface {
	Expr

	isObject()
}

// ImportedObject is a named language entity imported from another package,
// such as a constant, type, variable, function, etc.
//
// Unlike the go/ast package, this also includes literal
// values (e.g. "foo").
type ImportedObject struct {
	Name       string
	ImportPath string
}

func NewImportedObject(name string, importPath string) ImportedObject {
	return ImportedObject{
		Name:       name,
		ImportPath: importPath,
	}
}

func (i ImportedObject) isExpr()   {}
func (i ImportedObject) isObject() {}

func (i ImportedObject) WriteTo(w *Writer) {
	alias := w.imports.Add(i.ImportPath)
	w.Write(fmt.Sprintf("%s.%s", alias, i.Name))
}

// LocalObject is a named language entity referenced within the same
// package such as a constant, type, variable, function, etc.
//
// Unlike the go/ast package, this also includes literal values (e.g. "foo").
type LocalObject struct {
	Name string
}

func NewLocalObject(name string) LocalObject {
	return LocalObject{
		Name: name,
	}
}

func (l LocalObject) isExpr()   {}
func (l LocalObject) isObject() {}

func (l LocalObject) WriteTo(w *Writer) {
	w.Write(l.Name)
}
