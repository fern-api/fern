
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

                # @return [void]
                def test_get; end

                # @return [void]
                def test_post; end

                # @return [void]
                def test_put; end

                # @return [void]
                def test_patch; end

                # @return [void]
                def test_delete; end
            end
        end
    end
end
