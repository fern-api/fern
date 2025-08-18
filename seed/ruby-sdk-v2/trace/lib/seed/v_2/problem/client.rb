
module Seed
    module V2
        module Problem
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::V2::Problem::Client]
                def initialize(client)
                    @client = client
                end

                # Returns lightweight versions of all problems
                #
                # @return [Array[Seed::V2::Problem::LightweightProblemInfoV2]]
                def get_lightweight_problems(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # Returns latest versions of all problems
                #
                # @return [Array[Seed::V2::Problem::ProblemInfoV2]]
                def get_problems(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # Returns latest version of a problem
                #
                # @return [Seed::V2::Problem::ProblemInfoV2]
                def get_latest_problem(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)

                    else
                        raise _response.body
                end

                # Returns requested version of a problem
                #
                # @return [Seed::V2::Problem::ProblemInfoV2]
                def get_problem_version(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)

                    else
                        raise _response.body
                end

        end
    end
end
