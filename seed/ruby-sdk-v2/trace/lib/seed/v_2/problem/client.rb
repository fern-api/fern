# frozen_string_literal: true

module Seed
  module V2
    module Problem
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # Returns lightweight versions of all problems
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::V2::Problem::Types::LightweightProblemInfoV2]]
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
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [Array[Seed::V2::Problem::Types::ProblemInfoV2]]
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
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Seed::Commons::Types::ProblemId] :problem_id
        #
        # @return [Seed::V2::Problem::Types::ProblemInfoV2]
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
            Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end

        # Returns requested version of a problem
        #
        # @param request_options [Hash]
        # @param params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        # @option params [Seed::Commons::Types::ProblemId] :problem_id
        # @option params [Integer] :problem_version
        #
        # @return [Seed::V2::Problem::Types::ProblemInfoV2]
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
            Seed::V2::Problem::Types::ProblemInfoV2.load(_response.body)
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(_response.body, code: code)
          end
        end
      end
    end
  end
end
