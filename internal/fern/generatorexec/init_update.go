package generatorexec

type InitUpdate struct {
	PackagesToPublish []*PackageCoordinate `json:"packagesToPublish"`
}
