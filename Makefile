.PHONY: build
build:
	docker build -t fernapi/fern-go-model .

.PHONY: generate
generate: install
	cd internal/fern; fern-go-model ir_config.json && fern-go-model generator_exec_config.json

.PHONY: install
install:
	go install ./cmd/...

.PHONY: test
test:
	go test ./...
