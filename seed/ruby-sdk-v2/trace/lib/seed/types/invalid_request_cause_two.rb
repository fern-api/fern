# frozen_string_literal: true

module Seed
  module Types
    class InvalidRequestCauseTwo < Internal::Types::Model
      field :type, -> { Seed::Types::InvalidRequestCauseTwoType }, optional: false, nullable: false
    end
  end
end
