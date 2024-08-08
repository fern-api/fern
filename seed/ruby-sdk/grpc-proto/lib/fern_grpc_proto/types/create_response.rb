# frozen_string_literal: true

require_relative "user_model"
require "ostruct"
require "json"

module SeedApiClient
  class CreateResponse
    # @return [SeedApiClient::UserModel]
    attr_reader :user
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param user [SeedApiClient::UserModel]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::CreateResponse]
    def initialize(user: OMIT, additional_properties: nil)
      @user = user if user != OMIT
      @additional_properties = additional_properties
      @_field_set = { "user": user }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of CreateResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::CreateResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      if parsed_json["user"].nil?
        user = nil
      else
        user = parsed_json["user"].to_json
        user = SeedApiClient::UserModel.from_json(json_object: user)
      end
      new(user: user, additional_properties: struct)
    end

    # Serialize an instance of CreateResponse to a JSON object
    #
    # @return [String]
    def to_json(*_args)
      @_field_set&.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given
    #  hash and check each fields type against the current object's property
    #  definitions.
    #
    # @param obj [Object]
    # @return [Void]
    def self.validate_raw(obj:)
      obj.user.nil? || SeedApiClient::UserModel.validate_raw(obj: obj.user)
    end
  end
end
