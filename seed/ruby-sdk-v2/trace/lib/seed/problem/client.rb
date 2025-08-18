
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

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Problem::Types::CreateProblemResponse.load(_response.body)

                else
                    raise _response.body
            end

            # Updates a problem
            #
            # @return [Seed::Problem::UpdateProblemResponse]
            def update_problem(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/problem-crud/update/#{params[:problemId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Problem::Types::UpdateProblemResponse.load(_response.body)

                else
                    raise _response.body
            end

            # Soft deletes a problem
            #
            # @return [untyped]
            def delete_problem(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

            # Returns default starter files for problem
            #
            # @return [Seed::Problem::GetDefaultStarterFilesResponse]
            def get_default_starter_files(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Problem::Types::GetDefaultStarterFilesResponse.load(_response.body)

                else
                    raise _response.body
            end

    end
end
