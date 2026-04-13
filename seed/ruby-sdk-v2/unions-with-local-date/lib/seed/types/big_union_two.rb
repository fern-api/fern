# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwo < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwoType }, optional: false, nullable: false
    end
  end
end
