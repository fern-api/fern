# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicativeDiscriminantsZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithDuplicativeDiscriminantsZeroType }, optional: false, nullable: true
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
