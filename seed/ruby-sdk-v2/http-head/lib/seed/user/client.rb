
module Seed
    module User
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::User::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def head
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::user::User]]
            def list
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
