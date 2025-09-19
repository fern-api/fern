# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def patch(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "",
          body: params
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Update with JSON merge patch - complex types.
      # This endpoint demonstrates the distinction between:
      # - optional<T> fields (can be present or absent, but not null)
      # - optional<nullable<T>> fields (can be present, absent, or null)
      #
      # @return [untyped]
      def patch_complex(request_options: {}, **params)
        _path_param_names = ["id"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "complex/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Named request with mixed optional/nullable fields and merge-patch content type.
      # This should trigger the NPE issue when optional fields aren't initialized.
      #
      # @return [untyped]
      def named_patch_with_mixed(request_options: {}, **params)
        _path_param_names = ["id"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "named-mixed/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
      # This endpoint should:
      # 1. Not NPE when fields are not provided (tests initialization)
      # 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
      #
      # @return [untyped]
      def optional_merge_patch_test(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "optional-merge-patch-test",
          body: params
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end

      # Regular PATCH endpoint without merge-patch semantics
      #
      # @return [untyped]
      def regular_patch(request_options: {}, **params)
        _path_param_names = ["id"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "regular/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
