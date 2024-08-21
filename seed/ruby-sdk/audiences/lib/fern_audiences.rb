# frozen_string_literal: true

require_relative "environment"
require_relative "types_export"
require_relative "requests"
require_relative "fern_audiences/folder_a/client"
require_relative "fern_audiences/folder_d/client"
require_relative "fern_audiences/foo/client"

module SeedAudiencesClient
  class Client
    # @return [SeedAudiencesClient::FolderA::Client]
    attr_reader :folder_a
    # @return [SeedAudiencesClient::FolderD::Client]
    attr_reader :folder_d
    # @return [SeedAudiencesClient::FooClient]
    attr_reader :foo

    # @param base_url [String]
    # @param environment [SeedAudiencesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAudiencesClient::Client]
    def initialize(base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedAudiencesClient::RequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @folder_a = SeedAudiencesClient::FolderA::Client.new(request_client: @request_client)
      @folder_d = SeedAudiencesClient::FolderD::Client.new(request_client: @request_client)
      @foo = SeedAudiencesClient::FooClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedAudiencesClient::FolderA::AsyncClient]
    attr_reader :folder_a
    # @return [SeedAudiencesClient::FolderD::AsyncClient]
    attr_reader :folder_d
    # @return [SeedAudiencesClient::AsyncFooClient]
    attr_reader :foo

    # @param base_url [String]
    # @param environment [SeedAudiencesClient::Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedAudiencesClient::AsyncClient]
    def initialize(base_url: nil, environment: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedAudiencesClient::AsyncRequestClient.new(
        base_url: base_url,
        environment: environment,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @folder_a = SeedAudiencesClient::FolderA::AsyncClient.new(request_client: @async_request_client)
      @folder_d = SeedAudiencesClient::FolderD::AsyncClient.new(request_client: @async_request_client)
      @foo = SeedAudiencesClient::AsyncFooClient.new(request_client: @async_request_client)
    end
  end
end
