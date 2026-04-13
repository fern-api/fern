# frozen_string_literal: true

module Seed
  module Types
    class BigUnionNineteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionNineteenType }, optional: false, nullable: false
    end
  end
end
