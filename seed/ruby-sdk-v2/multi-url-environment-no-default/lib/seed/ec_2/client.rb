
module Seed
    module Ec2
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Ec2::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def boot_instance
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
