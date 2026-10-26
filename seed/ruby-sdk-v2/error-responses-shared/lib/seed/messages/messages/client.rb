# frozen_string_literal: true

module Seed
  module Messages
    module Messages
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param _params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.messages.messages.list_messages
        #
        # @return [Array[Seed::Messages::Types::Message]]
        def list_messages(request_options: {}, **_params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "messages",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Internal::Types::Utils.coerce(Internal::Types::Array[Seed::Messages::Types::Message], (response.body.to_s.empty? ? nil : JSON.parse(response.body, symbolize_names: true)))
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            error_types = {
              401 => Seed::Types::ServiceErrorResponse,
              429 => Seed::Types::ServiceErrorResponse
            }
            error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
            raise error_class.new(response.body, code: code, body: error_body)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Messages::Types::Message]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.messages.messages.create_message(
        #     sid: "sid",
        #     body: "body"
        #   )
        #
        # @return [Seed::Messages::Types::Message]
        def create_message(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "messages",
            body: Seed::Messages::Types::Message.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            (response.body.to_s.empty? ? nil : Seed::Messages::Types::Message.load(response.body))
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            error_types = {
              400 => Seed::Types::ServiceErrorResponse,
              422 => Seed::Types::ServiceErrorResponse,
              429 => Seed::Types::ServiceErrorResponse
            }
            error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
            raise error_class.new(response.body, code: code, body: error_body)
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :sid
        #
        # @example
        #   client.messages.messages.delete_message(sid: "sid")
        #
        # @return [untyped]
        def delete_message(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "DELETE",
            path: "messages/#{URI.encode_uri_component(params[:sid].to_s)}",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          error_types = {
            404 => Seed::Types::ServiceErrorResponse
          }
          error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
          raise error_class.new(response.body, code: code, body: error_body)
        end
      end
    end
  end
end
