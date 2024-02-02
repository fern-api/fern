# frozen_string_literal: true

require_relative "seed_file_upload_client/service/types/maybe_list"
require_relative "seed_file_upload_client/service/types/maybe_list_or_set"
require_relative "seed_file_upload_client/service/types/my_object"
require "faraday"
require "faraday/multipart"
require_relative "seed_file_upload_client/service/client"
require "async/http/faraday"

module SeedFileUploadClient
  class Client
    attr_reader :service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds)
      @service_client = Service::ServiceClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_service_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_service_client = Service::AsyncServiceClient.new(request_client: request_client)
    end
  end
end
