# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      class TypeWithOptionalMap < Internal::Types::Model
        field :key, -> { String }, optional: false, nullable: false

        field :column_values, -> { Internal::Types::Hash[String, String] }, optional: false, nullable: false, api_name: "columnValues"
      end
    end
  end
end
