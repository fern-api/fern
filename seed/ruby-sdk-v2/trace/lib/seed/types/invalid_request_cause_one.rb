# frozen_string_literal: true

module Seed
  module Types
    class InvalidRequestCauseOne < Internal::Types::Model
      field :type, -> { Seed::Types::InvalidRequestCauseOneType }, optional: false, nullable: false
    end
  end
end
