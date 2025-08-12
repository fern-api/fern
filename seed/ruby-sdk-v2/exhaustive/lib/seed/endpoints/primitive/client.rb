
module Seed
    module Endpoints
        module Primitive
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Primitive::Client]
                def initialize(client)
                    @client = client
                end

                # @return [untyped]
                def get_and_return_string
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_int
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_long
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_double
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_bool
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_datetime
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_date
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_uuid
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [untyped]
                def get_and_return_base_64
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
