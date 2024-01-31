# frozen_string_literal: true

require "async"

module SeedExhaustiveClient
  module Endpoints
    module Params
      class ParamsClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [ParamsClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param param [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_with_path(param:, request_options: nil)
          @request_client.conn.get("/params/path/#{param}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end

        # @param query [String]
        # @param number [Integer]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_query(query:, number:, request_options: nil)
          @request_client.conn.get("/params") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "query": query, "number": number }.compact
          end
        end

        # @param query [String]
        # @param numer [Integer]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_allow_multiple_query(query:, numer:, request_options: nil)
          @request_client.conn.get("/params") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "query": query, "numer": numer }.compact
          end
        end

        # @param param [String]
        # @param query [String]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_path_and_query(param:, query:, request_options: nil)
          @request_client.conn.get("/params/path/#{param}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "query": query }.compact
          end
        end

        # @param param [String]
        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def modify_with_path(param:, request:, request_options: nil)
          @request_client.conn.put("/params/path/#{param}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end

      class AsyncParamsClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncParamsClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param param [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_with_path(param:, request_options: nil)
          Async.call do
            response = @request_client.conn.get("/params/path/#{param}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
            end
            response
          end
        end

        # @param query [String]
        # @param number [Integer]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_query(query:, number:, request_options: nil)
          Async.call do
            @request_client.conn.get("/params") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.params = { **request_options&.additional_query_parameters, "query": query, "number": number }.compact
            end
          end
        end

        # @param query [String]
        # @param numer [Integer]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_allow_multiple_query(query:, numer:, request_options: nil)
          Async.call do
            @request_client.conn.get("/params") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.params = { **request_options&.additional_query_parameters, "query": query, "numer": numer }.compact
            end
          end
        end

        # @param param [String]
        # @param query [String]
        # @param request_options [RequestOptions]
        # @return [Void]
        def get_with_path_and_query(param:, query:, request_options: nil)
          Async.call do
            @request_client.conn.get("/params/path/#{param}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.params = { **request_options&.additional_query_parameters, "query": query }.compact
            end
          end
        end

        # @param param [String]
        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def modify_with_path(param:, request:, request_options: nil)
          Async.call do
            response = @request_client.conn.put("/params/path/#{param}") do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.headers = { **req.headers, **request_options&.additional_headers }.compact
              req.body = { **request, **request_options&.additional_body_parameters }.compact
            end
            response
          end
        end
      end
    end
  end
end
