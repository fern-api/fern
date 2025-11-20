# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Service::Types::PatchProxyRequest]
      #
      # @return [untyped]
      def patch(request_options: {}, **params)
        _body_prop_names = %i[application require_auth]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "",
          body: Seed::Service::Types::PatchProxyRequest.new(_body_bag).to_h
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
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Service::Types::PatchComplexRequest]
      # @option params [String] :id
      #
      # @return [untyped]
      def patch_complex(request_options: {}, **params)
        _path_param_names = %i[id]
        _body = params.except(*_path_param_names)
        _body_prop_names = %i[name age active metadata tags email nickname bio profile_image_url settings]
        _body_bag = _body.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "complex/#{params[:id]}",
          body: Seed::Service::Types::PatchComplexRequest.new(_body_bag).to_h
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
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Service::Types::NamedMixedPatchRequest]
      # @option params [String] :id
      #
      # @return [untyped]
      def named_patch_with_mixed(request_options: {}, **params)
        _path_param_names = %i[id]
        _body = params.except(*_path_param_names)
        _body_prop_names = %i[app_id instructions active]
        _body_bag = _body.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "named-mixed/#{params[:id]}",
          body: Seed::Service::Types::NamedMixedPatchRequest.new(_body_bag).to_h
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
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Service::Types::OptionalMergePatchRequest]
      #
      # @return [untyped]
      def optional_merge_patch_test(request_options: {}, **params)
        _body_prop_names = %i[required_field optional_string optional_integer optional_boolean nullable_string]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "optional-merge-patch-test",
          body: Seed::Service::Types::OptionalMergePatchRequest.new(_body_bag).to_h
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
      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Service::Types::RegularPatchRequest]
      # @option params [String] :id
      #
      # @return [untyped]
      def regular_patch(request_options: {}, **params)
        _path_param_names = %i[id]
        _body = params.except(*_path_param_names)
        _body_prop_names = %i[field_1 field_2]
        _body_bag = _body.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "regular/#{params[:id]}",
          body: Seed::Service::Types::RegularPatchRequest.new(_body_bag).to_h
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
