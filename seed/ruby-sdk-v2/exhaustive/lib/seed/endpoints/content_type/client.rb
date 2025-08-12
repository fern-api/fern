
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
                def post_json_patch_content_type
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def post_json_patch_content_with_charset_type
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
