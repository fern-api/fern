# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_mixed_file_directory/organization/client"
require_relative "fern_mixed_file_directory/user/client"

module SeedMixedFileDirectoryClient
  class Client
    # @return [SeedMixedFileDirectoryClient::OrganizationClient]
    attr_reader :organization
    # @return [SeedMixedFileDirectoryClient::UserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedMixedFileDirectoryClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedMixedFileDirectoryClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @organization = SeedMixedFileDirectoryClient::OrganizationClient.new(request_client: @request_client)
      @user = SeedMixedFileDirectoryClient::UserClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedMixedFileDirectoryClient::AsyncOrganizationClient]
    attr_reader :organization
    # @return [SeedMixedFileDirectoryClient::AsyncUserClient]
    attr_reader :user

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedMixedFileDirectoryClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedMixedFileDirectoryClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @organization = SeedMixedFileDirectoryClient::AsyncOrganizationClient.new(request_client: @async_request_client)
      @user = SeedMixedFileDirectoryClient::AsyncUserClient.new(request_client: @async_request_client)
    end
  end
end
