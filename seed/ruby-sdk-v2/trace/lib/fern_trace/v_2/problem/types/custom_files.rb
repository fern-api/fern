# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class CustomFiles < Internal::Types::Model
          extend FernTrace::Internal::Types::Union

          discriminant :type

          member -> { FernTrace::V2::Problem::Types::BasicCustomFiles }, key: "BASIC"
          member -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::Files] }, key: "CUSTOM"
        end
      end
    end
  end
end
