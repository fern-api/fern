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
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @service_client = ServiceClient.initialize(request_client: request_client)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_service_client = AsyncServiceClient.initialize(request_client: request_client)
    end
  end
end
