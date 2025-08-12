
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

                # @return [Array[Seed::v_2::problem::LightweightProblemInfoV2]]
                def get_lightweight_problems
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Array[Seed::v_2::problem::ProblemInfoV2]]
                def get_problems
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::v_2::problem::ProblemInfoV2]
                def get_latest_problem
                    raise NotImplementedError, 'This method is not yet implemented.'
                end

                # @return [Seed::v_2::problem::ProblemInfoV2]
                def get_problem_version
                    raise NotImplementedError, 'This method is not yet implemented.'
                end
            end
        end
    end
end
