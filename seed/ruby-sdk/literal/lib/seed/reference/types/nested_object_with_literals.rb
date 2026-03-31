# frozen_string_literal: true

module Seed
  module Reference
    module Types
      class NestedObjectWithLiterals < Internal::Types::Model
        field :literal_1, -> { String }, optional: false, nullable: false, api_name: "literal1"
        field :literal_2, -> { String }, optional: false, nullable: false, api_name: "literal2"
        field :str_prop, -> { String }, optional: false, nullable: false, api_name: "strProp"
      end
    end
  end
end
