# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_cross_package_type_names/folder_a/client"
require_relative "fern_cross_package_type_names/folder_d/client"
require_relative "fern_cross_package_type_names/foo/client"

module SeedCrossPackageTypeNamesClient
  class Client
    # @return [SeedCrossPackageTypeNamesClient::FolderA::Client]
    attr_reader :folder_a
    # @return [SeedCrossPackageTypeNamesClient::FolderD::Client]
    attr_reader :folder_d
    # @return [SeedCrossPackageTypeNamesClient::FooClient]
    attr_reader :foo

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedCrossPackageTypeNamesClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedCrossPackageTypeNamesClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @folder_a = SeedCrossPackageTypeNamesClient::FolderA::Client.new(request_client: @request_client)
      @folder_d = SeedCrossPackageTypeNamesClient::FolderD::Client.new(request_client: @request_client)
      @foo = SeedCrossPackageTypeNamesClient::FooClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedCrossPackageTypeNamesClient::FolderA::AsyncClient]
    attr_reader :folder_a
    # @return [SeedCrossPackageTypeNamesClient::FolderD::AsyncClient]
    attr_reader :folder_d
    # @return [SeedCrossPackageTypeNamesClient::AsyncFooClient]
    attr_reader :foo

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedCrossPackageTypeNamesClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedCrossPackageTypeNamesClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @folder_a = SeedCrossPackageTypeNamesClient::FolderA::AsyncClient.new(request_client: @async_request_client)
      @folder_d = SeedCrossPackageTypeNamesClient::FolderD::AsyncClient.new(request_client: @async_request_client)
      @foo = SeedCrossPackageTypeNamesClient::AsyncFooClient.new(request_client: @async_request_client)
    end
  end
end
