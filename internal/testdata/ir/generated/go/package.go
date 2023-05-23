package ir

type Package struct {
	Docs               *string        `json:"docs"`
	FernFilepath       *FernFilepath  `json:"fernFilepath"`
	Service            *ServiceId     `json:"service"`
	Types              []TypeId       `json:"types"`
	Errors             []ErrorId      `json:"errors"`
	Subpackages        []SubpackageId `json:"subpackages"`
	HasEndpointsInTree bool           `json:"hasEndpointsInTree"`
}
