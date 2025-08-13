
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
            def set_num_warm_instances(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Hash[Seed::Commons::Language, Integer]]
            def get_num_warm_instances(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
