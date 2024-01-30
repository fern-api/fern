# frozen_string_literal: true

require "date"
require "async"

module SeedExhaustiveClient
  module Endpoints
    module Primitive
      class PrimitiveClient
        attr_reader :request_client

        # @param request_client [RequestClient]
        # @return [PrimitiveClient]
        def initialize(request_client:)
          # @type [RequestClient]
          @request_client = request_client
        end

        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_and_return_string(request:, request_options: nil)
          @request_client.conn.post("/primitive/string") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [Integer]
        # @param request_options [RequestOptions]
        # @return [Integer]
        def get_and_return_int(request:, request_options: nil)
          @request_client.conn.post("/primitive/integer") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [Long]
        # @param request_options [RequestOptions]
        # @return [Long]
        def get_and_return_long(request:, request_options: nil)
          @request_client.conn.post("/primitive/long") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [Float]
        # @param request_options [RequestOptions]
        # @return [Float]
        def get_and_return_double(request:, request_options: nil)
          @request_client.conn.post("/primitive/double") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [Boolean]
        # @param request_options [RequestOptions]
        # @return [Boolean]
        def get_and_return_bool(request:, request_options: nil)
          @request_client.conn.post("/primitive/boolean") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [DateTime]
        # @param request_options [RequestOptions]
        # @return [DateTime]
        def get_and_return_datetime(request:, request_options: nil)
          response = @request_client.conn.post("/primitive/datetime") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          DateTime.parse(response)
        end

        # @param request [Date]
        # @param request_options [RequestOptions]
        # @return [Date]
        def get_and_return_date(request:, request_options: nil)
          response = @request_client.conn.post("/primitive/date") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
          Date.parse(response)
        end

        # @param request [UUID]
        # @param request_options [RequestOptions]
        # @return [UUID]
        def get_and_return_uuid(request:, request_options: nil)
          @request_client.conn.post("/primitive/uuid") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end

        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_and_return_base_64(request:, request_options: nil)
          @request_client.conn.post("/primitive/base64") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = request
          end
        end
      end

      class AsyncPrimitiveClient
        attr_reader :request_client

        # @param request_client [AsyncRequestClient]
        # @return [AsyncPrimitiveClient]
        def initialize(request_client:)
          # @type [AsyncRequestClient]
          @request_client = request_client
        end

        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_and_return_string(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/string") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [Integer]
        # @param request_options [RequestOptions]
        # @return [Integer]
        def get_and_return_int(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/integer") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [Long]
        # @param request_options [RequestOptions]
        # @return [Long]
        def get_and_return_long(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/long") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [Float]
        # @param request_options [RequestOptions]
        # @return [Float]
        def get_and_return_double(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/double") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [Boolean]
        # @param request_options [RequestOptions]
        # @return [Boolean]
        def get_and_return_bool(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/boolean") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [DateTime]
        # @param request_options [RequestOptions]
        # @return [DateTime]
        def get_and_return_datetime(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/datetime") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            DateTime.parse(response)
          end
        end

        # @param request [Date]
        # @param request_options [RequestOptions]
        # @return [Date]
        def get_and_return_date(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/date") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            Date.parse(response)
          end
        end

        # @param request [UUID]
        # @param request_options [RequestOptions]
        # @return [UUID]
        def get_and_return_uuid(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/uuid") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end

        # @param request [String]
        # @param request_options [RequestOptions]
        # @return [String]
        def get_and_return_base_64(request:, request_options: nil)
          Async.call do
            response = @request_client.conn.post("/primitive/base64") do |req|
              req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
              req.body = request
            end
            response
          end
        end
      end
    end
  end
end
