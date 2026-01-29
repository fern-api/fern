# frozen_string_literal: true

module Seed
  module Types
    class ResourceList < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Account }
      member -> { Seed::Types::Patient }
      member -> { Seed::Types::Practitioner }
      member -> { Seed::Types::Script }
    end
  end
end
