
module Seed
    module Sysprop
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Sysprop::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def set_num_warm_instances
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Hash[Seed::commons::Language, Integer]]
            def get_num_warm_instances
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
