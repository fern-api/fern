# frozen_string_literal: true

module Seed
  module Types
    class CastMember < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Actor }
      member -> { Seed::Types::Actress }
      member -> { Seed::Types::StuntDouble }
    end
  end
end
