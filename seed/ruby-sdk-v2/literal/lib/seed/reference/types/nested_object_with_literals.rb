# frozen_string_literal: true

module Seed
  module Reference
    module Types
      class NestedObjectWithLiterals < Internal::Types::Model
        field :literal1, -> { String }, optional: false, nullable: false
        field :literal2, -> { String }, optional: false, nullable: false
        field :str_prop, -> { String }, optional: false, nullable: false, api_name: "strProp"
      end
    end
  end
end
