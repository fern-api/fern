
module Seed
    module V2
        module V3
            module Problem
                class Client
                    # @option client [Seed::Internal::Http::RawClient]
                    #
                    # @return [Seed::V2::V3::Problem::Client]
                    def initialize(client)
                        @client = client
                    end

                    # Returns lightweight versions of all problems
                    #
<<<<<<< HEAD
                    # @return [Array[Seed::V2::V3::Problem::LightweightProblemInfoV2]]
                    def get_lightweight_problems(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Array[Seed::v_2::v_3::problem::LightweightProblemInfoV2]]
                    def get_lightweight_problems(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/problems-v2/lightweight-problem-info"
                        )
>>>>>>> ca21b06d09 (fix)
                    end

                    # Returns latest versions of all problems
                    #
<<<<<<< HEAD
                    # @return [Array[Seed::V2::V3::Problem::ProblemInfoV2]]
                    def get_problems(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Array[Seed::v_2::v_3::problem::ProblemInfoV2]]
                    def get_problems(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/problems-v2/problem-info"
                        )
>>>>>>> ca21b06d09 (fix)
                    end

                    # Returns latest version of a problem
                    #
<<<<<<< HEAD
                    # @return [Seed::V2::V3::Problem::ProblemInfoV2]
                    def get_latest_problem(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Seed::v_2::v_3::problem::ProblemInfoV2]
                    def get_latest_problem(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/problems-v2/problem-info/#{params[:problemId]}"
                        )
>>>>>>> ca21b06d09 (fix)
                    end

                    # Returns requested version of a problem
                    #
<<<<<<< HEAD
                    # @return [Seed::V2::V3::Problem::ProblemInfoV2]
                    def get_problem_version(request_options: {}, **params)
                        raise NotImplementedError, 'This method is not yet implemented.'
=======
                    # @return [Seed::v_2::v_3::problem::ProblemInfoV2]
                    def get_problem_version(request_options: {}, **params)
                        _request = Seed::Internal::Http::JSONRequest.new(
                            method: GET,
                            path: "/problems-v2/problem-info/#{params[:problemId]}/version/#{params[:problemVersion]}"
                        )
>>>>>>> ca21b06d09 (fix)
                    end

            end
        end
    end
end
