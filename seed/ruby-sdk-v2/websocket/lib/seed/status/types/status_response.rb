# frozen_string_literal: true

module Seed
  module Status
    module Types
      class StatusResponse < Internal::Types::Model
        field :status, -> { String }, optional: false, nullable: false
      end
    end
  end
end
