# frozen_string_literal: true

require_relative "user"
require "ostruct"
require "json"

module SeedApiClient
  class NestedUser
    # @return [String]
    attr_reader :name
    # @return [SeedApiClient::User]
    attr_reader :user
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param name [String]
    # @param user [SeedApiClient::User]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::NestedUser]
    def initialize(name: OMIT, user: OMIT, additional_properties: nil)
      @name = name if name != OMIT
      @user = user if user != OMIT
      @additional_properties = additional_properties
      @_field_set = { "name": name, "user": user }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of NestedUser
    #
    # @param json_object [String]
    # @return [SeedApiClient::NestedUser]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      name = parsed_json["name"]
      if parsed_json["user"].nil?
        user = nil
      else
        user = parsed_json["user"].to_json
        user = SeedApiClient::User.from_json(json_object: user)
      end
      new(
        name: name,
        user: user,
        additional_properties: struct
      )
    end

    # Serialize an instance of NestedUser to a JSON object
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
      obj.name&.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      obj.user.nil? || SeedApiClient::User.validate_raw(obj: obj.user)
    end
  end
end
