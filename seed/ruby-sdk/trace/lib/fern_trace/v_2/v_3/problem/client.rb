# frozen_string_literal: true

require_relative "../../../../requests"
require_relative "types/lightweight_problem_info_v_2"
require "json"
require_relative "types/problem_info_v_2"
require "async"

module SeedTraceClient
  module V2
    module V3
      class ProblemClient
        # @return [SeedTraceClient::RequestClient]
        attr_reader :request_client

        # @param request_client [SeedTraceClient::RequestClient]
        # @return [SeedTraceClient::V2::V3::ProblemClient]
        def initialize(request_client:)
          @request_client = request_client
        end

        # Returns lightweight versions of all problems
        #
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [Array<SeedTraceClient::V2::V3::Problem::LightweightProblemInfoV2>]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_lightweight_problems
        def get_lightweight_problems(request_options: nil)
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/lightweight-problem-info"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::V3::Problem::LightweightProblemInfoV2.from_json(json_object: item)
          end
        end

        # Returns latest versions of all problems
        #
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [Array<SeedTraceClient::V2::V3::Problem::ProblemInfoV2>]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_problems
        def get_problems(request_options: nil)
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info"
          end
          parsed_json = JSON.parse(response.body)
          parsed_json&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: item)
          end
        end

        # Returns latest version of a problem
        #
        # @param problem_id [String]
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [SeedTraceClient::V2::V3::Problem::ProblemInfoV2]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_latest_problem(problem_id: "problemId")
        def get_latest_problem(problem_id:, request_options: nil)
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}"
          end
          SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: response.body)
        end

        # Returns requested version of a problem
        #
        # @param problem_id [String]
        # @param problem_version [Integer]
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [SeedTraceClient::V2::V3::Problem::ProblemInfoV2]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_problem_version(problem_id: "problemId", problem_version: 1)
        def get_problem_version(problem_id:, problem_version:, request_options: nil)
          response = @request_client.conn.get do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {})
            }.compact
            unless request_options.nil? || request_options&.additional_query_parameters.nil?
              req.params = { **(request_options&.additional_query_parameters || {}) }.compact
            end
            unless request_options.nil? || request_options&.additional_body_parameters.nil?
              req.body = { **(request_options&.additional_body_parameters || {}) }.compact
            end
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}/version/#{problem_version}"
          end
          SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: response.body)
        end
      end

      class AsyncProblemClient
        # @return [SeedTraceClient::AsyncRequestClient]
        attr_reader :request_client

        # @param request_client [SeedTraceClient::AsyncRequestClient]
        # @return [SeedTraceClient::V2::V3::AsyncProblemClient]
        def initialize(request_client:)
          @request_client = request_client
        end

        # Returns lightweight versions of all problems
        #
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [Array<SeedTraceClient::V2::V3::Problem::LightweightProblemInfoV2>]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_lightweight_problems
        def get_lightweight_problems(request_options: nil)
          Async do
            response = @request_client.conn.get do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
              unless request_options&.x_random_header.nil?
                req.headers["X-Random-Header"] =
                  request_options.x_random_header
              end
              req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {})
              }.compact
              unless request_options.nil? || request_options&.additional_query_parameters.nil?
                req.params = { **(request_options&.additional_query_parameters || {}) }.compact
              end
              unless request_options.nil? || request_options&.additional_body_parameters.nil?
                req.body = { **(request_options&.additional_body_parameters || {}) }.compact
              end
              req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/lightweight-problem-info"
            end
            parsed_json = JSON.parse(response.body)
            parsed_json&.map do |item|
              item = item.to_json
              SeedTraceClient::V2::V3::Problem::LightweightProblemInfoV2.from_json(json_object: item)
            end
          end
        end

        # Returns latest versions of all problems
        #
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [Array<SeedTraceClient::V2::V3::Problem::ProblemInfoV2>]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_problems
        def get_problems(request_options: nil)
          Async do
            response = @request_client.conn.get do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
              unless request_options&.x_random_header.nil?
                req.headers["X-Random-Header"] =
                  request_options.x_random_header
              end
              req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {})
              }.compact
              unless request_options.nil? || request_options&.additional_query_parameters.nil?
                req.params = { **(request_options&.additional_query_parameters || {}) }.compact
              end
              unless request_options.nil? || request_options&.additional_body_parameters.nil?
                req.body = { **(request_options&.additional_body_parameters || {}) }.compact
              end
              req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info"
            end
            parsed_json = JSON.parse(response.body)
            parsed_json&.map do |item|
              item = item.to_json
              SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: item)
            end
          end
        end

        # Returns latest version of a problem
        #
        # @param problem_id [String]
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [SeedTraceClient::V2::V3::Problem::ProblemInfoV2]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_latest_problem(problem_id: "problemId")
        def get_latest_problem(problem_id:, request_options: nil)
          Async do
            response = @request_client.conn.get do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
              unless request_options&.x_random_header.nil?
                req.headers["X-Random-Header"] =
                  request_options.x_random_header
              end
              req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {})
              }.compact
              unless request_options.nil? || request_options&.additional_query_parameters.nil?
                req.params = { **(request_options&.additional_query_parameters || {}) }.compact
              end
              unless request_options.nil? || request_options&.additional_body_parameters.nil?
                req.body = { **(request_options&.additional_body_parameters || {}) }.compact
              end
              req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}"
            end
            SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: response.body)
          end
        end

        # Returns requested version of a problem
        #
        # @param problem_id [String]
        # @param problem_version [Integer]
        # @param request_options [SeedTraceClient::RequestOptions]
        # @return [SeedTraceClient::V2::V3::Problem::ProblemInfoV2]
        # @example
        #  trace = SeedTraceClient::Client.new(
        #    base_url: "https://api.example.com",
        #    environment: SeedTraceClient::Environment::PROD,
        #    token: "YOUR_AUTH_TOKEN"
        #  )
        #  trace.v_2.v_3.problem.get_problem_version(problem_id: "problemId", problem_version: 1)
        def get_problem_version(problem_id:, problem_version:, request_options: nil)
          Async do
            response = @request_client.conn.get do |req|
              req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
              req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
              unless request_options&.x_random_header.nil?
                req.headers["X-Random-Header"] =
                  request_options.x_random_header
              end
              req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {})
              }.compact
              unless request_options.nil? || request_options&.additional_query_parameters.nil?
                req.params = { **(request_options&.additional_query_parameters || {}) }.compact
              end
              unless request_options.nil? || request_options&.additional_body_parameters.nil?
                req.body = { **(request_options&.additional_body_parameters || {}) }.compact
              end
              req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}/version/#{problem_version}"
            end
            SeedTraceClient::V2::V3::Problem::ProblemInfoV2.from_json(json_object: response.body)
          end
        end
      end
    end
  end
end
