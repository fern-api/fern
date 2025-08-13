
module Seed
    module Bigunion
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Bigunion::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::bigunion::BigUnion]
            def get
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def update
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Hash[String, bool]]
            def update_many
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
