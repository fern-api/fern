
module Seed
    module Problem
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Problem::Client]
            def initialize(client)
                @client = client
            end

            # Creates a problem
            #
            # @return [Seed::Problem::CreateProblemResponse]
            def create_problem(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/problem-crud/create"
                )
            end

            # Updates a problem
            #
            # @return [Seed::Problem::UpdateProblemResponse]
            def update_problem(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/problem-crud/update/#{params[:problemId]}"
                )
            end

            # Soft deletes a problem
            #
            # @return [untyped]
            def delete_problem(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # Returns default starter files for problem
            #
            # @return [Seed::Problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

    end
end
