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
	npm install -g @fern-api/seed-cli@0.17.0-rc0-2-gde917225c
	seed test \
		--fixture bytes \
		--fixture enum \
		--fixture file-upload \
		--fixture idempotency-headers \
		--fixture literal \
		--fixture literal-headers \
		--fixture plain-text \
		--fixture query-parameters \
		--fixture response-property \
		--fixture streaming

.PHONY: fixtures
fixtures: install
	@./scripts/update-fixtures.sh
