# frozen_string_literal: true

module Seed
  module Service
    module Types
      class Response < Internal::Types::Model
        field :data, -> { Seed::Service::Types::Movie }, optional: false, nullable: false
      end
    end
  end
end
