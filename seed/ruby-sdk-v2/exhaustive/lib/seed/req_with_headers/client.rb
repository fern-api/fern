
module Seed
    module ReqWithHeaders
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::ReqWithHeaders::Client]
            def initialize(client)
                @client = client
            end

            # @return [void]
            def get_with_custom_header; end
        end
    end
end
