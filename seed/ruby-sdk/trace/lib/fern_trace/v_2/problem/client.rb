# frozen_string_literal: true

require_relative "../../../requests"
require_relative "types/lightweight_problem_info_v_2"
require_relative "types/problem_info_v_2"
require_relative "../../commons/types/problem_id"
require "async"

module SeedTraceClient
  module V2
    class ProblemClient
      attr_reader :request_client

      # @param request_client [SeedTraceClient::RequestClient]
      # @return [SeedTraceClient::V2::ProblemClient]
      def initialize(request_client:)
        # @type [SeedTraceClient::RequestClient]
        @request_client = request_client
      end

      # Returns lightweight versions of all problems
      #
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Array<SeedTraceClient::V2::Problem::LightweightProblemInfoV2>]
      def get_lightweight_problems(request_options: nil)
        response = @request_client.conn.get("/problems-v2/lightweight-problem-info") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/lightweight-problem-info"
        end
        return if response.body.nil?

        response.body.map do |v|
          v = v.to_json
          SeedTraceClient::V2::Problem::LightweightProblemInfoV2.from_json(json_object: v)
        end
      end

      # Returns latest versions of all problems
      #
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Array<SeedTraceClient::V2::Problem::ProblemInfoV2>]
      def get_problems(request_options: nil)
        response = @request_client.conn.get("/problems-v2/problem-info") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info"
        end
        return if response.body.nil?

        response.body.map do |v|
          v = v.to_json
          SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: v)
        end
      end

      # Returns latest version of a problem
      #
      # @param problem_id [SeedTraceClient::Commons::PROBLEM_ID]
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
      def get_latest_problem(problem_id:, request_options: nil)
        response = @request_client.conn.get("/problems-v2/problem-info/#{problem_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}"
        end
        SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: response.body)
      end

      # Returns requested version of a problem
      #
      # @param problem_id [SeedTraceClient::Commons::PROBLEM_ID]
      # @param problem_version [Integer]
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
      def get_problem_version(problem_id:, problem_version:, request_options: nil)
        response = @request_client.conn.get("/problems-v2/problem-info/#{problem_id}/version/#{problem_version}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}/version/#{problem_version}"
        end
        SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: response.body)
      end
    end

    class AsyncProblemClient
      attr_reader :request_client

      # @param request_client [SeedTraceClient::AsyncRequestClient]
      # @return [SeedTraceClient::V2::AsyncProblemClient]
      def initialize(request_client:)
        # @type [SeedTraceClient::AsyncRequestClient]
        @request_client = request_client
      end

      # Returns lightweight versions of all problems
      #
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Array<SeedTraceClient::V2::Problem::LightweightProblemInfoV2>]
      def get_lightweight_problems(request_options: nil)
        Async do
          response = @request_client.conn.get("/problems-v2/lightweight-problem-info") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/lightweight-problem-info"
          end
          response.body&.map do |v|
            v = v.to_json
            SeedTraceClient::V2::Problem::LightweightProblemInfoV2.from_json(json_object: v)
          end
        end
      end

      # Returns latest versions of all problems
      #
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [Array<SeedTraceClient::V2::Problem::ProblemInfoV2>]
      def get_problems(request_options: nil)
        Async do
          response = @request_client.conn.get("/problems-v2/problem-info") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info"
          end
          response.body&.map do |v|
            v = v.to_json
            SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: v)
          end
        end
      end

      # Returns latest version of a problem
      #
      # @param problem_id [SeedTraceClient::Commons::PROBLEM_ID]
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
      def get_latest_problem(problem_id:, request_options: nil)
        Async do
          response = @request_client.conn.get("/problems-v2/problem-info/#{problem_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}"
          end
          SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: response.body)
        end
      end

      # Returns requested version of a problem
      #
      # @param problem_id [SeedTraceClient::Commons::PROBLEM_ID]
      # @param problem_version [Integer]
      # @param request_options [SeedTraceClient::RequestOptions]
      # @return [SeedTraceClient::V2::Problem::ProblemInfoV2]
      def get_problem_version(problem_id:, problem_version:, request_options: nil)
        Async do
          response = @request_client.conn.get("/problems-v2/problem-info/#{problem_id}/version/#{problem_version}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
            unless request_options&.x_random_header.nil?
              req.headers["X-Random-Header"] =
                request_options.x_random_header
            end
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/problems-v2/problem-info/#{problem_id}/version/#{problem_version}"
          end
          SeedTraceClient::V2::Problem::ProblemInfoV2.from_json(json_object: response.body)
        end
      end
    end
  end
end
