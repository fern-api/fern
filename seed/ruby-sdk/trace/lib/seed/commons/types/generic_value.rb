# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class GenericValue < Internal::Types::Model
        field :stringified_type, -> { String }, optional: true, nullable: false, api_name: "stringifiedType"
        field :stringified_value, -> { String }, optional: false, nullable: false, api_name: "stringifiedValue"
      end
    end
  end
end
