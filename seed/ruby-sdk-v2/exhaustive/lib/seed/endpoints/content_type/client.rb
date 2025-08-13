
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
                end

                # @return [untyped]
                def post_json_patch_content_with_charset_type(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/foo/baz"
                    )
                end

        end
    end
end
