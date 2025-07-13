# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_union"
require_relative "types/metadata"
require "json"
require_relative "types/metadata_union"
require_relative "types/request"
require_relative "types/union_with_duplicate_types"
require_relative "types/nested_union_root"
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
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
      SeedUndiscriminatedUnionsClient::Union::MyUnion.from_json(json_object: response.body)
    end

    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [SeedUndiscriminatedUnionsClient::Union::METADATA]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.get_metadata
    def get_metadata(request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
      end
      JSON.parse(response.body)
    end

    # @param request [SeedUndiscriminatedUnionsClient::Union::OPTIONAL_METADATA, SeedUndiscriminatedUnionsClient::Union::NamedMetadata]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.update_metadata(request: { "string": {"key":"value"} })
    def update_metadata(request:, request_options: nil)
      response = @request_client.conn.put do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
      end
      JSON.parse(response.body)
    end

    # @param request [Hash] Request of type SeedUndiscriminatedUnionsClient::Union::Request, as a Hash
    #   * :union (Hash)
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.call(request: { union: { "union": {"key":"value"} } })
    def call(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/call"
      end
      JSON.parse(response.body)
    end

    # @param request [String, Array<String>, Integer, Set<String>]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String, Array<String>, Integer, Set<String>]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.duplicate_types_union(request: "string")
    def duplicate_types_union(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/duplicate"
      end
      SeedUndiscriminatedUnionsClient::Union::UnionWithDuplicateTypes.from_json(json_object: response.body)
    end

    # @param request [String, Array<String>, SeedUndiscriminatedUnionsClient::Union::NestedUnionL1]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.nested_unions(request: "string")
    def nested_unions(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/nested"
      end
      JSON.parse(response.body)
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
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
        SeedUndiscriminatedUnionsClient::Union::MyUnion.from_json(json_object: response.body)
      end
    end

    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [SeedUndiscriminatedUnionsClient::Union::METADATA]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.get_metadata
    def get_metadata(request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request [SeedUndiscriminatedUnionsClient::Union::OPTIONAL_METADATA, SeedUndiscriminatedUnionsClient::Union::NamedMetadata]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.update_metadata(request: { "string": {"key":"value"} })
    def update_metadata(request:, request_options: nil)
      Async do
        response = @request_client.conn.put do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request [Hash] Request of type SeedUndiscriminatedUnionsClient::Union::Request, as a Hash
    #   * :union (Hash)
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [Boolean]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.call(request: { union: { "union": {"key":"value"} } })
    def call(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/call"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param request [String, Array<String>, Integer, Set<String>]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String, Array<String>, Integer, Set<String>]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.duplicate_types_union(request: "string")
    def duplicate_types_union(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/duplicate"
        end
        SeedUndiscriminatedUnionsClient::Union::UnionWithDuplicateTypes.from_json(json_object: response.body)
      end
    end

    # @param request [String, Array<String>, SeedUndiscriminatedUnionsClient::Union::NestedUnionL1]
    # @param request_options [SeedUndiscriminatedUnionsClient::RequestOptions]
    # @return [String]
    # @example
    #  undiscriminated_unions = SeedUndiscriminatedUnionsClient::Client.new(base_url: "https://api.example.com")
    #  undiscriminated_unions.union.nested_unions(request: "string")
    def nested_unions(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/nested"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end
  end
end
