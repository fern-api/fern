
module Seed
  module V2
    module Problem
      class Client
        # @return [Seed::V2::Problem::Client]
        def initialize(client:)
          @client = client
        end

        # Returns lightweight versions of all problems
        #
        # @return [Array[Seed::V2::Problem::Types::LightweightProblemInfoV2]]
        def get_lightweight_problems(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/problems-v2/lightweight-problem-info"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # Returns latest versions of all problems
        #
        # @return [Array[Seed::V2::Problem::Types::ProblemInfoV2]]
        def get_problems(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/problems-v2/problem-info"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # Returns latest version of a problem
        #
        # @return [Seed::V2::Problem::Types::ProblemInfoV2]
        def get_latest_problem(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/problems-v2/problem-info/#{"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)
          else
            raise _response.body
          end
        end

        # Returns requested version of a problem
        #
        # @return [Seed::V2::Problem::Types::ProblemInfoV2]
        def get_problem_version(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/problems-v2/problem-info/#{/version/#{"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)
          else
            raise _response.body
          end
        end

      end
    end
  end
end
