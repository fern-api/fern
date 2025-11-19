# frozen_string_literal: true

module Seed
  module Endpoints
    module ContentType
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::ContentType::Client]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash[untyped, untyped]]
        #
        # @param params [Hash[untyped, untyped]]
        #
        # @return [untyped]
        def post_json_patch_content_type(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/foo/bar",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h
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

        # @param request_options [Hash[untyped, untyped]]
        #
        # @param params [Hash[untyped, untyped]]
        #
        # @return [untyped]
        def post_json_patch_content_with_charset_type(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/foo/baz",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params).to_h
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
end
