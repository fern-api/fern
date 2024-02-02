# frozen_string_literal: true

require_relative "seed_examples_client/commons/types/types/metadata"

require_relative "seed_examples_client/commons/types/types/data"
require_relative "seed_examples_client/commons/types/types/event_info"
require_relative "seed_examples_client/commons/types/types/tag"
require_relative "seed_examples_client/file/service/types/filename"
require_relative "seed_examples_client/types/types/actor"
require_relative "seed_examples_client/types/types/actress"
require_relative "seed_examples_client/types/types/cast_member"
require_relative "seed_examples_client/types/types/directory"
require_relative "seed_examples_client/types/types/exception"
require_relative "seed_examples_client/types/types/exception_info"
require_relative "seed_examples_client/types/types/extended_movie"
require_relative "seed_examples_client/types/types/file"
require_relative "seed_examples_client/types/types/metadata"
require_relative "seed_examples_client/types/types/migration"
require_relative "seed_examples_client/types/types/moment"
require_relative "seed_examples_client/types/types/movie"
require_relative "seed_examples_client/types/types/movie_id"
require_relative "seed_examples_client/types/types/node"
require_relative "seed_examples_client/types/types/request"
require_relative "seed_examples_client/types/types/response"
require_relative "seed_examples_client/types/types/stunt_double"
require_relative "seed_examples_client/types/types/test"
require_relative "seed_examples_client/types/types/tree"
require "faraday"
require_relative "seed_examples_client/file/notification/service/client"
require_relative "seed_examples_client/file/notificationclient"
require_relative "seed_examples_client/file/service/client"
require_relative "seed_examples_client/fileclient"
require_relative "seed_examples_client/health/service/client"
require_relative "seed_examples_client/healthclient"
require_relative "seed_examples_client/service/client"
require "async/http/faraday"

module SeedExamplesClient
  class Client
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @client = Client.initialize(request_client: request_client)
      @client = Client.initialize(request_client: request_client)
      @service_client = ServiceClient.initialize(request_client: request_client)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(request:, request_options: nil)
      request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_client.token if request_client.token.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end

  class AsyncClient
    # @param environment [Environment]
    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return []
    def initialize(environment: nil, max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.initialize(headers: headers, base_url: base_url, conn: conn)
      @async_client = AsyncClient.initialize(client: request_client)
      @async_client = AsyncClient.initialize(client: request_client)
      @async_service_client = AsyncServiceClient.initialize(request_client: request_client)
    end

    # @param request [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def echo(request:, request_options: nil)
      request_client.conn.post("/") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_client.token if request_client.token.nil?
        req.headers = { **req.headers, **request_options&.additional_headers }.compact
        req.body = { **request, **request_options&.additional_body_parameters }.compact
      end
    end
  end
end
