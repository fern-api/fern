# frozen_string_literal: true

require_relative "seed_response_property_client/types/optional_string_response"

require_relative "seed_response_property_client/service/types/movie"
require_relative "seed_response_property_client/service/types/optional_with_docs"
require_relative "seed_response_property_client/service/types/response"
require_relative "seed_response_property_client/service/types/with_docs"
require_relative "seed_response_property_client/types/string_response"
require_relative "seed_response_property_client/types/with_metadata"
require "faraday"
require_relative "seed_response_property_client/service/client"
require "async/http/faraday"

module SeedResponsePropertyClient
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
