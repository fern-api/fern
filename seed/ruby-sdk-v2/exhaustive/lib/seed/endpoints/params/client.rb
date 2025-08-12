
module Seed
    module Endpoints
        module Params
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Params::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_with_path
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_with_inline_path
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_with_query
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_with_allow_multiple_query
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_with_path_and_query
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_with_inline_path_and_query
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def modify_with_path
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def modify_with_inline_path
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
