
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

                # @return [void]
                def post_json_patch_content_type; end

                # @return [void]
                def post_json_patch_content_with_charset_type; end
            end
        end
    end
end
