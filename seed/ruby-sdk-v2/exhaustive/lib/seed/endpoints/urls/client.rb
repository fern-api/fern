
module Seed
    module Endpoints
        module Urls
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Urls::Client]
                def initialize(client)
                    @client = client
                end

                # @return [void]
                def with_mixed_case; end

                # @return [void]
                def no_ending_slash; end

                # @return [void]
                def with_ending_slash; end

                # @return [void]
                def with_underscores; end
            end
        end
    end
end
