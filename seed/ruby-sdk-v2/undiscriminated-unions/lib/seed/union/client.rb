
module Seed
    module Union
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Union::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::union::MyUnion]
            def get
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Hash[Seed::union::Key, String]]
            def get_metadata
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def update_metadata
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [bool]
            def call
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::union::UnionWithDuplicateTypes]
            def duplicate_types_union
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [String]
            def nested_unions
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
