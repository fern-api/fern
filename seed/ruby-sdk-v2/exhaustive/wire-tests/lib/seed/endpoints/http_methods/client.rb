# frozen_string_literal: true

module Seed
  module Endpoints
    module HTTPMethods
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @example
        #   client.endpoints.http_methods.test_get(id: "id")
        #
        # @return [String]
        def test_get(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/http-methods/#{URI.encode_uri_component(params[:id].to_s)}",
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
          raise error_class.new(response.body, code: code)
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.endpoints.http_methods.test_post(string: "string")
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_post(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/http-methods",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithRequiredField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @example
        #   client.endpoints.http_methods.test_put(
        #     id: "id",
        #     string: "string"
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_put(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[id]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/http-methods/#{URI.encode_uri_component(params[:id].to_s)}",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(body_params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Seed::Types::Object_::Types::ObjectWithOptionalField]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @example
        #   client.endpoints.http_methods.test_patch(
        #     id: "id",
        #     string: "string",
        #     integer: 1,
        #     long: 1000000,
        #     double: 1.1,
        #     bool: true,
        #     datetime: "2024-01-15T09:30:00Z",
        #     date: "2023-01-15",
        #     uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        #     base64: "SGVsbG8gd29ybGQh",
        #     list: %w[list list],
        #     set: Set.new(["set"]),
        #     map: {
        #       1 => "map"
        #     },
        #     bigint: "1000000"
        #   )
        #
        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_patch(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          path_param_names = %i[id]
          body_params = params.except(*path_param_names)

          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PATCH",
            path: "/http-methods/#{URI.encode_uri_component(params[:id].to_s)}",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(body_params).to_h,
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            Seed::Types::Object_::Types::ObjectWithOptionalField.load(response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
          end
        end

        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [String] :id
        #
        # @example
        #   client.endpoints.http_methods.test_delete(id: "id")
        #
        # @return [Boolean]
        def test_delete(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.normalize_keys(params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "DELETE",
            path: "/http-methods/#{URI.encode_uri_component(params[:id].to_s)}",
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
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
