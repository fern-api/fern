# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      class Request < Internal::Types::Model
        field :request, -> { Object }, optional: false, nullable: false
      end
    end
  end
end
