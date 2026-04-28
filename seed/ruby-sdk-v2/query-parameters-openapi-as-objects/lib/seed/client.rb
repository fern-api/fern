# frozen_string_literal: true

module Seed
  class Client
    # @param request_options [Hash]
    # @param params [Hash]
    # @option request_options [String] :base_url
    # @option request_options [Hash{String => Object}] :additional_headers
    # @option request_options [Hash{String => Object}] :additional_query_parameters
    # @option request_options [Hash{String => Object}] :additional_body_parameters
    # @option request_options [Integer] :timeout_in_seconds
    # @option params [Integer] :limit
    # @option params [String] :id
    # @option params [String] :date
    # @option params [String] :deadline
    # @option params [String] :bytes
    # @option params [Seed::Types::User] :user
    # @option params [Seed::Types::User, nil] :user_list
    # @option params [String, nil] :optional_deadline
    # @option params [Hash[String, String], nil] :key_value
    # @option params [String, nil] :optional_string
    # @option params [Seed::Types::NestedUser, nil] :nested_user
    # @option params [Seed::Types::User, nil] :optional_user
    # @option params [Seed::Types::User, nil] :exclude_user
    # @option params [String, nil] :filter
    # @option params [String, nil] :tags
    # @option params [String, nil] :optional_tags
    # @option params [Seed::Types::SearchRequestNeighbor, nil] :neighbor
    # @option params [Seed::Types::SearchRequestNeighborRequired] :neighbor_required
    #
    # @return [Seed::Types::SearchResponse]
    def search(request_options: {}, **params)
      params = Seed::Internal::Types::Utils.normalize_keys(params)
      query_param_names = %i[limit id date deadline bytes user user_list optional_deadline key_value optional_string nested_user optional_user exclude_user filter tags optional_tags neighbor neighbor_required]
      query_params = {}
      query_params["limit"] = params[:limit] if params.key?(:limit)
      query_params["id"] = params[:id] if params.key?(:id)
      query_params["date"] = params[:date] if params.key?(:date)
      query_params["deadline"] = params[:deadline] if params.key?(:deadline)
      query_params["bytes"] = params[:bytes] if params.key?(:bytes)
      query_params["user"] = params[:user] if params.key?(:user)
      query_params["userList"] = params[:user_list] if params.key?(:user_list)
      query_params["optionalDeadline"] = params[:optional_deadline] if params.key?(:optional_deadline)
      query_params["keyValue"] = params[:key_value] if params.key?(:key_value)
      query_params["optionalString"] = params[:optional_string] if params.key?(:optional_string)
      query_params["nestedUser"] = params[:nested_user] if params.key?(:nested_user)
      query_params["optionalUser"] = params[:optional_user] if params.key?(:optional_user)
      query_params["excludeUser"] = params[:exclude_user] if params.key?(:exclude_user)
      query_params["filter"] = params[:filter] if params.key?(:filter)
      query_params["tags"] = params[:tags] if params.key?(:tags)
      query_params["optionalTags"] = params[:optional_tags] if params.key?(:optional_tags)
      query_params["neighbor"] = params[:neighbor] if params.key?(:neighbor)
      query_params["neighborRequired"] = params[:neighbor_required] if params.key?(:neighbor_required)
      params.except(*query_param_names)

      request = Seed::Internal::JSON::Request.new(
        base_url: request_options[:base_url],
        method: "GET",
        path: "user/getUsername",
        query: query_params,
        request_options: request_options
      )
      begin
        response = @client.send(request)
      rescue Net::HTTPRequestTimeout
        raise Seed::Errors::TimeoutError
      end
      code = response.code.to_i
      if code.between?(200, 299)
        Seed::Types::SearchResponse.load(response.body)
      else
        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end

    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_query-parameters-openapi-as-objects/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end
  end
end
