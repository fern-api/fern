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
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
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
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "complex/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Named request with mixed optional/nullable fields and merge-patch content type.
      # This should trigger the NPE issue when optional fields aren't initialized.
      #
      # @return [untyped]
      def named_patch_with_mixed(request_options: {}, **params)
        _path_param_names = ["id"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "named-mixed/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
      # This endpoint should:
      # 1. Not NPE when fields are not provided (tests initialization)
      # 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
      #
      # @return [untyped]
      def optional_merge_patch_test(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "optional-merge-patch-test",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Regular PATCH endpoint without merge-patch semantics
      #
      # @return [untyped]
      def regular_patch(request_options: {}, **params)
        _path_param_names = ["id"]

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PATCH",
          path: "regular/#{params[:id]}",
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
