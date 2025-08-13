
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
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Problem::CreateProblemResponse]
=======
            # @return [Seed::problem::CreateProblemResponse]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Problem::CreateProblemResponse]
>>>>>>> 51153df442 (fix)
            def create_problem(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/problem-crud/create"
                )
            end

            # Updates a problem
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Problem::UpdateProblemResponse]
=======
            # @return [Seed::problem::UpdateProblemResponse]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Problem::UpdateProblemResponse]
>>>>>>> 51153df442 (fix)
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
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/problem-crud/delete/#{params[:problemId]}"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # Returns default starter files for problem
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/problem-crud/default-starter-files"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
