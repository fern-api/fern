# frozen_string_literal: true

require_relative "seed_api_client/a/types/a"
require_relative "seed_api_client/ast/types/container_value"
require_relative "seed_api_client/ast/types/field_value"
require_relative "seed_api_client/ast/types/object_value"
require_relative "seed_api_client/types/importing_a"
require_relative "seed_api_client/types/root_type"
require "async/http/faraday"
require "faraday"

module SeedApiClient
  class Client
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
    end
  end

  class AsyncClient
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @return []
    def initialize(max_retries: nil, timeout_in_seconds: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
    end
  end
end
