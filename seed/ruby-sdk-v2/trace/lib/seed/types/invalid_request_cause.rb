# frozen_string_literal: true

module Seed
  module Types
    class InvalidRequestCause < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::InvalidRequestCauseZero }
      member -> { Seed::Types::InvalidRequestCauseOne }
      member -> { Seed::Types::InvalidRequestCauseTwo }
    end
  end
end
