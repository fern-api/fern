# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class VariantC < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false

      field :value_c, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "valueC"
    end
  end
end
