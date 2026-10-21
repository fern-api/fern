# frozen_string_literal: true

require_relative "../../../seed"

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
