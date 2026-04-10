# frozen_string_literal: true

module Seed
  module Types
    class UnionWithBasePropertiesTwo < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithBasePropertiesTwoType }, optional: false, nullable: false
    end
  end
end
