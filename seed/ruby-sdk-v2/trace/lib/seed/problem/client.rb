
module Seed
    module Problem
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Problem::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::problem::CreateProblemResponse]
            def create_problem
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::problem::UpdateProblemResponse]
            def update_problem
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def delete_problem
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
