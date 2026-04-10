# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Seed::Service::Types::ServicePatchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def patch(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "",
          body: Seed::Service::Types::ServicePatchRequest.new(params).to_h,
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

      # Update with JSON merge patch - complex types.
      # This endpoint demonstrates the distinction between:
      # - optional<T> fields (can be present or absent, but not null)
      # - optional<nullable<T>> fields (can be present, absent, or null)
      #
      # @param request_options [Hash]
      # @param params [Seed::Service::Types::ServicePatchComplexRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id
      #
      # @return [untyped]
      def patchcomplex(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Service::Types::ServicePatchComplexRequest.new(params).to_h
        non_body_param_names = ["id"]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "complex/#{URI.encode_uri_component(params[:id].to_s)}",
          body: body,
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

      # Named request with mixed optional/nullable fields and merge-patch content type.
      # This should trigger the NPE issue when optional fields aren't initialized.
      #
      # @param request_options [Hash]
      # @param params [Seed::Service::Types::ServiceNamedPatchWithMixedRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id
      #
      # @return [untyped]
      def namedpatchwithmixed(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Service::Types::ServiceNamedPatchWithMixedRequest.new(params).to_h
        non_body_param_names = ["id"]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "named-mixed/#{URI.encode_uri_component(params[:id].to_s)}",
          body: body,
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

      # Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
      # This endpoint should:
      # 1. Not NPE when fields are not provided (tests initialization)
      # 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
      #
      # @param request_options [Hash]
      # @param params [Seed::Service::Types::ServiceOptionalMergePatchTestRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def optionalmergepatchtest(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "optional-merge-patch-test",
          body: Seed::Service::Types::ServiceOptionalMergePatchTestRequest.new(params).to_h,
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

      # Regular PATCH endpoint without merge-patch semantics
      #
      # @param request_options [Hash]
      # @param params [Seed::Service::Types::ServiceRegularPatchRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id
      #
      # @return [untyped]
      def regularpatch(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request_data = Seed::Service::Types::ServiceRegularPatchRequest.new(params).to_h
        non_body_param_names = ["id"]
        body = request_data.except(*non_body_param_names)

        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "regular/#{URI.encode_uri_component(params[:id].to_s)}",
          body: body,
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
