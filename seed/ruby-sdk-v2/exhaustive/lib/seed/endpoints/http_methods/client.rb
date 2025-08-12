
module Seed
    module Endpoints
        module HttpMethods
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::HttpMethods::Client]
                def initialize(client)
                    @client = client
                end

                # @return [String]
                def test_get
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::types::object::ObjectWithOptionalField]
                def test_post
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::types::object::ObjectWithOptionalField]
                def test_put
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::types::object::ObjectWithOptionalField]
                def test_patch
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [bool]
                def test_delete
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
