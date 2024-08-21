# frozen_string_literal: true

require_relative "metadata"
require "ostruct"
require "json"

module SeedApiClient
  class UserModel
    # @return [String]
    attr_reader :username
    # @return [String]
    attr_reader :email
    # @return [Integer]
    attr_reader :age
    # @return [Float]
    attr_reader :weight
    # @return [SeedApiClient::Metadata]
    attr_reader :metadata
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param username [String]
    # @param email [String]
    # @param age [Integer]
    # @param weight [Float]
    # @param metadata [SeedApiClient::Metadata]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::UserModel]
    def initialize(username: OMIT, email: OMIT, age: OMIT, weight: OMIT, metadata: OMIT, additional_properties: nil)
      @username = username if username != OMIT
      @email = email if email != OMIT
      @age = age if age != OMIT
      @weight = weight if weight != OMIT
      @metadata = metadata if metadata != OMIT
      @additional_properties = additional_properties
      @_field_set = {
        "username": username,
        "email": email,
        "age": age,
        "weight": weight,
        "metadata": metadata
      }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of UserModel
    #
    # @param json_object [String]
    # @return [SeedApiClient::UserModel]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      username = parsed_json["username"]
      email = parsed_json["email"]
      age = parsed_json["age"]
      weight = parsed_json["weight"]
      if parsed_json["metadata"].nil?
        metadata = nil
      else
        metadata = parsed_json["metadata"].to_json
        metadata = SeedApiClient::Metadata.from_json(json_object: metadata)
      end
      new(
        username: username,
        email: email,
        age: age,
        weight: weight,
        metadata: metadata,
        additional_properties: struct
      )
    end

    # Serialize an instance of UserModel to a JSON object
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
      obj.username&.is_a?(String) != false || raise("Passed value for field obj.username is not the expected type, validation failed.")
      obj.email&.is_a?(String) != false || raise("Passed value for field obj.email is not the expected type, validation failed.")
      obj.age&.is_a?(Integer) != false || raise("Passed value for field obj.age is not the expected type, validation failed.")
      obj.weight&.is_a?(Float) != false || raise("Passed value for field obj.weight is not the expected type, validation failed.")
      obj.metadata.nil? || SeedApiClient::Metadata.validate_raw(obj: obj.metadata)
    end
  end
end
