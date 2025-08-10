
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

                # @return [void]
                def get_with_path; end

                # @return [void]
                def get_with_inline_path; end

                # @return [void]
                def get_with_query; end

                # @return [void]
                def get_with_allow_multiple_query; end

                # @return [void]
                def get_with_path_and_query; end

                # @return [void]
                def get_with_inline_path_and_query; end

                # @return [void]
                def modify_with_path; end

                # @return [void]
                def modify_with_inline_path; end
            end
        end
    end
end
