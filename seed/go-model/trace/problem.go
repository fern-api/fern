// Code generated by Fern. DO NOT EDIT.

package trace

import (
    json "encoding/json"
    internal "github.com/trace/fern/internal"
    fmt "fmt"
)


type ProblemInfo struct {
    ProblemId ProblemId `json:"problemId" url:"problemId"`
    ProblemDescription *ProblemDescription `json:"problemDescription" url:"problemDescription"`
    ProblemName string `json:"problemName" url:"problemName"`
    ProblemVersion int `json:"problemVersion" url:"problemVersion"`
    Files map[*Language]*ProblemFiles `json:"files" url:"files"`
    InputParams []*VariableTypeAndName `json:"inputParams" url:"inputParams"`
    OutputType *VariableType `json:"outputType" url:"outputType"`
    Testcases []*TestCaseWithExpectedResult `json:"testcases" url:"testcases"`
    MethodName string `json:"methodName" url:"methodName"`
    SupportsCustomTestCases bool `json:"supportsCustomTestCases" url:"supportsCustomTestCases"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (p *ProblemInfo) GetProblemId() ProblemId{
    if p == nil {
        return ""
    }
    return p.ProblemId
}

func (p *ProblemInfo) GetProblemDescription() *ProblemDescription{
    if p == nil {
        return nil
    }
    return p.ProblemDescription
}

func (p *ProblemInfo) GetProblemName() string{
    if p == nil {
        return ""
    }
    return p.ProblemName
}

func (p *ProblemInfo) GetProblemVersion() int{
    if p == nil {
        return 0
    }
    return p.ProblemVersion
}

func (p *ProblemInfo) GetFiles() map[*Language]*ProblemFiles{
    if p == nil {
        return nil
    }
    return p.Files
}

func (p *ProblemInfo) GetInputParams() []*VariableTypeAndName{
    if p == nil {
        return nil
    }
    return p.InputParams
}

func (p *ProblemInfo) GetOutputType() *VariableType{
    if p == nil {
        return nil
    }
    return p.OutputType
}

func (p *ProblemInfo) GetTestcases() []*TestCaseWithExpectedResult{
    if p == nil {
        return nil
    }
    return p.Testcases
}

func (p *ProblemInfo) GetMethodName() string{
    if p == nil {
        return ""
    }
    return p.MethodName
}

func (p *ProblemInfo) GetSupportsCustomTestCases() bool{
    if p == nil {
        return false
    }
    return p.SupportsCustomTestCases
}

func (p *ProblemInfo) GetExtraProperties() map[string]any{
    if p == nil {
        return nil
    }
    return p.extraProperties
}

func (p *ProblemInfo) String() string{
    if len(p.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(p.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(p); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", p)
}


type ProblemDescription struct {
    Boards []*ProblemDescriptionBoard `json:"boards" url:"boards"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (p *ProblemDescription) GetBoards() []*ProblemDescriptionBoard{
    if p == nil {
        return nil
    }
    return p.Boards
}

func (p *ProblemDescription) GetExtraProperties() map[string]any{
    if p == nil {
        return nil
    }
    return p.extraProperties
}

func (p *ProblemDescription) String() string{
    if len(p.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(p.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(p); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", p)
}


type ProblemDescriptionBoard struct {
    Type string
    Html string
    Variable *VariableValue
    TestCaseId string
}


type ProblemFiles struct {
    SolutionFile *FileInfo `json:"solutionFile" url:"solutionFile"`
    ReadOnlyFiles []*FileInfo `json:"readOnlyFiles" url:"readOnlyFiles"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (p *ProblemFiles) GetSolutionFile() *FileInfo{
    if p == nil {
        return nil
    }
    return p.SolutionFile
}

func (p *ProblemFiles) GetReadOnlyFiles() []*FileInfo{
    if p == nil {
        return nil
    }
    return p.ReadOnlyFiles
}

func (p *ProblemFiles) GetExtraProperties() map[string]any{
    if p == nil {
        return nil
    }
    return p.extraProperties
}

func (p *ProblemFiles) String() string{
    if len(p.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(p.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(p); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", p)
}


type VariableTypeAndName struct {
    VariableType *VariableType `json:"variableType" url:"variableType"`
    Name string `json:"name" url:"name"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (v *VariableTypeAndName) GetVariableType() *VariableType{
    if v == nil {
        return nil
    }
    return v.VariableType
}

func (v *VariableTypeAndName) GetName() string{
    if v == nil {
        return ""
    }
    return v.Name
}

func (v *VariableTypeAndName) GetExtraProperties() map[string]any{
    if v == nil {
        return nil
    }
    return v.extraProperties
}

func (v *VariableTypeAndName) String() string{
    if len(v.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(v.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(v); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", v)
}


type CreateProblemRequest struct {
    ProblemName string `json:"problemName" url:"problemName"`
    ProblemDescription *ProblemDescription `json:"problemDescription" url:"problemDescription"`
    Files map[*Language]*ProblemFiles `json:"files" url:"files"`
    InputParams []*VariableTypeAndName `json:"inputParams" url:"inputParams"`
    OutputType *VariableType `json:"outputType" url:"outputType"`
    Testcases []*TestCaseWithExpectedResult `json:"testcases" url:"testcases"`
    MethodName string `json:"methodName" url:"methodName"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (c *CreateProblemRequest) GetProblemName() string{
    if c == nil {
        return ""
    }
    return c.ProblemName
}

func (c *CreateProblemRequest) GetProblemDescription() *ProblemDescription{
    if c == nil {
        return nil
    }
    return c.ProblemDescription
}

func (c *CreateProblemRequest) GetFiles() map[*Language]*ProblemFiles{
    if c == nil {
        return nil
    }
    return c.Files
}

func (c *CreateProblemRequest) GetInputParams() []*VariableTypeAndName{
    if c == nil {
        return nil
    }
    return c.InputParams
}

func (c *CreateProblemRequest) GetOutputType() *VariableType{
    if c == nil {
        return nil
    }
    return c.OutputType
}

func (c *CreateProblemRequest) GetTestcases() []*TestCaseWithExpectedResult{
    if c == nil {
        return nil
    }
    return c.Testcases
}

func (c *CreateProblemRequest) GetMethodName() string{
    if c == nil {
        return ""
    }
    return c.MethodName
}

func (c *CreateProblemRequest) GetExtraProperties() map[string]any{
    if c == nil {
        return nil
    }
    return c.extraProperties
}

func (c *CreateProblemRequest) String() string{
    if len(c.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(c.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(c); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", c)
}


type CreateProblemResponse struct {
    Type string
    Success ProblemId
    Error *CreateProblemError
}


type UpdateProblemResponse struct {
    ProblemVersion int `json:"problemVersion" url:"problemVersion"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (u *UpdateProblemResponse) GetProblemVersion() int{
    if u == nil {
        return 0
    }
    return u.ProblemVersion
}

func (u *UpdateProblemResponse) GetExtraProperties() map[string]any{
    if u == nil {
        return nil
    }
    return u.extraProperties
}

func (u *UpdateProblemResponse) String() string{
    if len(u.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(u.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(u); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", u)
}


type CreateProblemError struct {
    ErrorType string
    Generic GenericCreateProblemError
}


type GenericCreateProblemError struct {
    Message string `json:"message" url:"message"`
    Type string `json:"type" url:"type"`
    Stacktrace string `json:"stacktrace" url:"stacktrace"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (g *GenericCreateProblemError) GetMessage() string{
    if g == nil {
        return ""
    }
    return g.Message
}

func (g *GenericCreateProblemError) GetType() string{
    if g == nil {
        return ""
    }
    return g.Type
}

func (g *GenericCreateProblemError) GetStacktrace() string{
    if g == nil {
        return ""
    }
    return g.Stacktrace
}

func (g *GenericCreateProblemError) GetExtraProperties() map[string]any{
    if g == nil {
        return nil
    }
    return g.extraProperties
}

func (g *GenericCreateProblemError) String() string{
    if len(g.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(g.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(g); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", g)
}


type GetDefaultStarterFilesResponse struct {
    Files map[*Language]*ProblemFiles `json:"files" url:"files"`

    extraProperties map[string]any
    rawJSON json.RawMessage
}

func (g *GetDefaultStarterFilesResponse) GetFiles() map[*Language]*ProblemFiles{
    if g == nil {
        return nil
    }
    return g.Files
}

func (g *GetDefaultStarterFilesResponse) GetExtraProperties() map[string]any{
    if g == nil {
        return nil
    }
    return g.extraProperties
}

func (g *GetDefaultStarterFilesResponse) String() string{
    if len(g.rawJSON) > 0 {
        if value, err := internal.StringifyJSON(g.rawJSON); err == nil {
            return value
        }
    }
    if value, err := internal.StringifyJSON(g); err == nil {
        return value
    }
    return fmt.Sprintf("%#v", g)
}

