# frozen_string_literal: true

require_relative "account"
require "ostruct"
require "json"

module SeedApiClient
  class Memo
    # @return [String]
    attr_reader :description
    # @return [SeedApiClient::Account]
    attr_reader :account
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param description [String]
    # @param account [SeedApiClient::Account]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::Memo]
    def initialize(description:, account: OMIT, additional_properties: nil)
      @description = description
      @account = account if account != OMIT
      @additional_properties = additional_properties
      @_field_set = { "description": description, "account": account }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of Memo
    #
    # @param json_object [String]
    # @return [SeedApiClient::Memo]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      description = parsed_json["description"]
      if parsed_json["account"].nil?
        account = nil
      else
        account = parsed_json["account"].to_json
        account = SeedApiClient::Account.from_json(json_object: account)
      end
      new(
        description: description,
        account: account,
        additional_properties: struct
      )
    end

    # Serialize an instance of Memo to a JSON object
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
      obj.description.is_a?(String) != false || raise("Passed value for field obj.description is not the expected type, validation failed.")
      obj.account.nil? || SeedApiClient::Account.validate_raw(obj: obj.account)
    end
  end
end
