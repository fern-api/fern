# frozen_string_literal: true

module Seed
  module Types
    class ResponseChildrenItem < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Say }

      member -> { Seed::Types::Dial }

      member -> { Seed::Types::Pause }

      member -> { Seed::Types::Hangup }

      member -> { Seed::Types::Redirect }
    end
  end
end
