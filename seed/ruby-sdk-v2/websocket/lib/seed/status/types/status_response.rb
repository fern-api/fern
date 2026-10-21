# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Status
    module Types
      class StatusResponse < Internal::Types::Model
        field :status, -> { String }, optional: false, nullable: false
      end
    end
  end
end
