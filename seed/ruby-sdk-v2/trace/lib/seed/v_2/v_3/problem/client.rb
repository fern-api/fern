# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        class Client
          # @return [Seed::V2::V3::Problem::Client]
          def initialize(client:)
            @client = client
          end

          # Returns lightweight versions of all problems
          #
          # @return [Array[Seed::V2::V3::Problem::Types::LightweightProblemInfoV2]]
          def get_lightweight_problems(request_options: {}, **_params)
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url] || Seed::Environment::PROD,
              method: "GET",
              path: "/problems-v2/lightweight-problem-info"
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            return if code.between?(200, 299)

            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end

          # Returns latest versions of all problems
          #
          # @return [Array[Seed::V2::V3::Problem::Types::ProblemInfoV2]]
          def get_problems(request_options: {}, **_params)
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url] || Seed::Environment::PROD,
              method: "GET",
              path: "/problems-v2/problem-info"
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            return if code.between?(200, 299)

            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end

          # Returns latest version of a problem
          #
          # @return [Seed::V2::V3::Problem::Types::ProblemInfoV2]
          def get_latest_problem(request_options: {}, **params)
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url] || Seed::Environment::PROD,
              method: "GET",
              path: "/problems-v2/problem-info/#{params[:problem_id]}"
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::V2::V3::Problem::Types::ProblemInfoV2.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end

          # Returns requested version of a problem
          #
          # @return [Seed::V2::V3::Problem::Types::ProblemInfoV2]
          def get_problem_version(request_options: {}, **params)
            _request = Seed::Internal::JSON::Request.new(
              base_url: request_options[:base_url] || Seed::Environment::PROD,
              method: "GET",
              path: "/problems-v2/problem-info/#{params[:problem_id]}/version/#{params[:problem_version]}"
            )
            begin
              _response = @client.send(_request)
            rescue Net::HTTPRequestTimeout
              raise Seed::Errors::TimeoutError
            end
            code = _response.code.to_i
            if code.between?(200, 299)
              Seed::V2::V3::Problem::Types::ProblemInfoV2.load(_response.body)
            else
              error_class = Seed::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(_response.body, code: code)
            end
          end
        end
      end
    end
  end
end
