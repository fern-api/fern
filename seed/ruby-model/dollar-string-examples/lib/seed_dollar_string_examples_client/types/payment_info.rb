# frozen_string_literal: true

require "ostruct"
require "json"

module SeedDollarStringExamplesClient
  class PaymentInfo
    # @return [String]
    attr_reader :amount
    # @return [String]
    attr_reader :currency
    # @return [String]
    attr_reader :description
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param amount [String]
    # @param currency [String]
    # @param description [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedDollarStringExamplesClient::PaymentInfo]
    def initialize(amount:, currency:, description: OMIT, additional_properties: nil)
      @amount = amount
      @currency = currency
      @description = description if description != OMIT
      @additional_properties = additional_properties
      @_field_set = { "amount": amount, "currency": currency, "description": description }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of PaymentInfo
    #
    # @param json_object [String]
    # @return [SeedDollarStringExamplesClient::PaymentInfo]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      amount = parsed_json["amount"]
      currency = parsed_json["currency"]
      description = parsed_json["description"]
      new(
        amount: amount,
        currency: currency,
        description: description,
        additional_properties: struct
      )
    end

    # Serialize an instance of PaymentInfo to a JSON object
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
      obj.amount.is_a?(String) != false || raise("Passed value for field obj.amount is not the expected type, validation failed.")
      obj.currency.is_a?(String) != false || raise("Passed value for field obj.currency is not the expected type, validation failed.")
      obj.description&.is_a?(String) != false || raise("Passed value for field obj.description is not the expected type, validation failed.")
    end
  end
end
