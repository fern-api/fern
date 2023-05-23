package generatorexec

type GithubOutputMode struct {
	Version     string             `json:"version"`
	RepoUrl     string             `json:"repoUrl"`
	PublishInfo *GithubPublishInfo `json:"publishInfo"`
}
