.PHONY: build
build:
	docker build -f ./docker/Dockerfile.model -t fernapi/fern-go-model .
	docker build -f ./docker/Dockerfile.sdk -t fernapi/fern-go-sdk .
	docker build -f ./docker/Dockerfile.fiber -t fernapi/fern-go-fiber .
	docker tag fernapi/fern-go-sdk fernapi/fern-go-sdk:0.0.0

.PHONY: generate
generate: install
	cd internal/fern; fern-go-model ir_config.json

.PHONY: install
install:
	go install ./cmd/...

.PHONY: test
test: install
	go test ./...

.PHONY: fixtures
fixtures: install
	@./scripts/update-fixtures.sh
