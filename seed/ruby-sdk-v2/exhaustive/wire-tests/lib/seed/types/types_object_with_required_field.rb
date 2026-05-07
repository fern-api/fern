# frozen_string_literal: true

module Seed
  module Types
    class TypesObjectWithRequiredField < Internal::Types::Model
      field :string, -> { String }, optional: false, nullable: false
    end
  end
end
