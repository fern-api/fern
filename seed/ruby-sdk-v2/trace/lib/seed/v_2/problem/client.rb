
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
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # Returns latest versions of all problems
                #
                # @return [Array[Seed::V2::Problem::ProblemInfoV2]]
                def get_problems(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # Returns latest version of a problem
                #
                # @return [Seed::V2::Problem::ProblemInfoV2]
                def get_latest_problem(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # Returns requested version of a problem
                #
                # @return [Seed::V2::Problem::ProblemInfoV2]
                def get_problem_version(request_options: {}, **params)
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

        end
    end
end
