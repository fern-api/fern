# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ExpressionLocation < Internal::Types::Model
        field :start, -> { Integer }, optional: false, nullable: false
        field :offset, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
