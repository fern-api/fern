
module Seed
  module Endpoints
    module ContentType
      class Client
        # @option client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Endpoints::ContentType::Client]
        def initialize(client)
          @client = client
        end

        # @return [untyped]
        def post_json_patch_content_type(request_options: {}, **params)
          _request = Seed::Internal::Http::JSONRequest.new(
            method: POST,
            path: "/foo/bar"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return
          else
            raise _response.body
          end
        end

        # @return [untyped]
        def post_json_patch_content_with_charset_type(request_options: {}, **params)
          _request = Seed::Internal::Http::JSONRequest.new(
            method: POST,
            path: "/foo/baz"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return
          else
            raise _response.body
          end
        end

      end
    end
  end
end
