# frozen_string_literal: true

module Seed
  module Types
    class BigUnionOne < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionOneType }, optional: false, nullable: false
    end
  end
end
