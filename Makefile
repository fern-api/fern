.PHONY: build
build:
	docker build -t fernapi/fern-go-model .

.PHONY: generate
generate: install
	cd internal/fern; fern-go-model config.json

.PHONY: install
install:
	go install ./cmd/...

.PHONY: test
test:
	go test ./...
