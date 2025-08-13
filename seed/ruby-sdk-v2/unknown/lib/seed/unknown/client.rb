
module Seed
    module Unknown
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Unknown::Client]
            def initialize(client)
                @client = client
            end

            # @return [Array[Hash[String, untyped]]]
            def post
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Hash[String, untyped]]]
            def post_object
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
