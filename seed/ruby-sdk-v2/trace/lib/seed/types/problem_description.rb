# frozen_string_literal: true

module Seed
  module Types
    class ProblemDescription < Internal::Types::Model
      field :boards, -> { Internal::Types::Array[Seed::Types::ProblemDescriptionBoard] }, optional: false, nullable: false
    end
  end
end
