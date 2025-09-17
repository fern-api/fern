# frozen_string_literal: true

require_relative "user_profile_verification"
require "ostruct"
require "json"

module SeedPropertyAccessClient
  # User profile object
  class UserProfile
    # @return [String] The name of the user.
    attr_reader :name
    # @return [SeedPropertyAccessClient::UserProfileVerification] User profile verification object
    attr_reader :verification
    # @return [String] The social security number of the user.
    attr_reader :ssn
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param name [String] The name of the user.
    # @param verification [SeedPropertyAccessClient::UserProfileVerification] User profile verification object
    # @param ssn [String] The social security number of the user.
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedPropertyAccessClient::UserProfile]
    def initialize(name:, verification:, ssn:, additional_properties: nil)
      @name = name
      @verification = verification
      @ssn = ssn
      @additional_properties = additional_properties
      @_field_set = { "name": name, "verification": verification, "ssn": ssn }
    end

    # Deserialize a JSON object to an instance of UserProfile
    #
    # @param json_object [String]
    # @return [SeedPropertyAccessClient::UserProfile]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      name = parsed_json["name"]
      if parsed_json["verification"].nil?
        verification = nil
      else
        verification = parsed_json["verification"].to_json
        verification = SeedPropertyAccessClient::UserProfileVerification.from_json(json_object: verification)
      end
      ssn = parsed_json["ssn"]
      new(
        name: name,
        verification: verification,
        ssn: ssn,
        additional_properties: struct
      )
    end

    # Serialize an instance of UserProfile to a JSON object
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
      obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
      SeedPropertyAccessClient::UserProfileVerification.validate_raw(obj: obj.verification)
      obj.ssn.is_a?(String) != false || raise("Passed value for field obj.ssn is not the expected type, validation failed.")
    end
  end
end
