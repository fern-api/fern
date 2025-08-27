# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class CustomFiles < Internal::Types::Model
            extend Seed::Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::V3::Problem::Types::BasicCustomFiles }, key: "BASIC"
            member lambda {
              Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::V3::Problem::Types::Files]
            }, key: "CUSTOM"
          end
        end
      end
    end
  end
end
