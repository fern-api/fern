# frozen_string_literal: true

require_relative "types_export"
require_relative "requests"
require_relative "fern_file_upload/service/client"

module SeedFileUploadClient
  class Client
    # @return [SeedFileUploadClient::ServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedFileUploadClient::Client]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @request_client = SeedFileUploadClient::RequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedFileUploadClient::ServiceClient.new(request_client: @request_client)
    end
  end

  class AsyncClient
    # @return [SeedFileUploadClient::AsyncServiceClient]
    attr_reader :service

    # @param base_url [String]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [SeedFileUploadClient::AsyncClient]
    def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      @async_request_client = SeedFileUploadClient::AsyncRequestClient.new(
        base_url: base_url,
        max_retries: max_retries,
        timeout_in_seconds: timeout_in_seconds
      )
      @service = SeedFileUploadClient::AsyncServiceClient.new(request_client: @async_request_client)
    end
  end
end
