# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        class Client
          # @param client [FernTrace::Internal::Http::RawClient]
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
          # @return [Array[FernTrace::V2::V3::Problem::Types::LightweightProblemInfoV2]]
          def get_lightweight_problems(request_options: {}, **params)
            FernTrace::Internal::Types::Utils.normalize_keys(params)
            request = FernTrace::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/problems-v2/lightweight-problem-info",
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise FernTrace::Errors::TimeoutError
            end
            code = response.code.to_i
            return if code.between?(200, 299)

            error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
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
          # @return [Array[FernTrace::V2::V3::Problem::Types::ProblemInfoV2]]
          def get_problems(request_options: {}, **params)
            FernTrace::Internal::Types::Utils.normalize_keys(params)
            request = FernTrace::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/problems-v2/problem-info",
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise FernTrace::Errors::TimeoutError
            end
            code = response.code.to_i
            return if code.between?(200, 299)

            error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
            raise error_class.new(response.body, code: code)
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
          # @option params [FernTrace::Commons::Types::ProblemId] :problem_id
          #
          # @return [FernTrace::V2::V3::Problem::Types::ProblemInfoV2]
          def get_latest_problem(request_options: {}, **params)
            params = FernTrace::Internal::Types::Utils.normalize_keys(params)
            request = FernTrace::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/problems-v2/problem-info/#{params[:problem_id]}",
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise FernTrace::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              FernTrace::V2::V3::Problem::Types::ProblemInfoV2.load(response.body)
            else
              error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
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
          # @option params [FernTrace::Commons::Types::ProblemId] :problem_id
          # @option params [Integer] :problem_version
          #
          # @return [FernTrace::V2::V3::Problem::Types::ProblemInfoV2]
          def get_problem_version(request_options: {}, **params)
            params = FernTrace::Internal::Types::Utils.normalize_keys(params)
            request = FernTrace::Internal::JSON::Request.new(
              base_url: request_options[:base_url],
              method: "GET",
              path: "/problems-v2/problem-info/#{params[:problem_id]}/version/#{params[:problem_version]}",
              request_options: request_options
            )
            begin
              response = @client.send(request)
            rescue Net::HTTPRequestTimeout
              raise FernTrace::Errors::TimeoutError
            end
            code = response.code.to_i
            if code.between?(200, 299)
              FernTrace::V2::V3::Problem::Types::ProblemInfoV2.load(response.body)
            else
              error_class = FernTrace::Errors::ResponseError.subclass_for_code(code)
              raise error_class.new(response.body, code: code)
            end
          end
        end
      end
    end
  end
end
