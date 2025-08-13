
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

                # @return [String]
                def with_mixed_case
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [String]
                def no_ending_slash
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [String]
                def with_ending_slash
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [String]
                def with_underscores
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
