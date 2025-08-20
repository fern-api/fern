# frozen_string_literal: true

module Seed
  module Endpoints
    module ContentType
      class Client
        # @return [Seed::Endpoints::ContentType::Client]
        def initialize(client:)
          @client = client
        end

        # @return [untyped]
        def post_json_patch_content_type(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/foo/bar",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # @return [untyped]
        def post_json_patch_content_with_charset_type(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/foo/baz",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
