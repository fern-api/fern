# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_union"
require "async"

module SeedUndiscriminatedUnionsClient
  class UnionClient
    # @return [SeedUndiscriminatedUnionsClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedUndiscriminatedUnionsClient::RequestClient]
    # @return [SeedUndiscriminatedUnionsClient::UnionClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>, Set<String>]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>, Set<String>]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.get(request: "string")
    def get(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      SeedUndiscriminatedUnionsClient::Union::MyUnion.from_json(json_object: response.body)
    end
  end

  class AsyncUnionClient
    # @return [SeedUndiscriminatedUnionsClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedUndiscriminatedUnionsClient::AsyncRequestClient]
    # @return [SeedUndiscriminatedUnionsClient::AsyncUnionClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>, Set<String>]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String, Array<String>, Integer, Array<Integer>, Array<Array<Integer>>, Set<String>]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.get(request: "string")
    def get(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        SeedUndiscriminatedUnionsClient::Union::MyUnion.from_json(json_object: response.body)
      end
    end
  end
end
