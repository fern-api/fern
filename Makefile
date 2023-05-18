.PHONY: build
build:
	docker build -t fernapi/fern-go-model .

.PHONY: test
test:
	go test ./...
