# frozen_string_literal: true

module Seed
  module Clients
    module Types
      class ClientRequest < Internal::Types::Model
        field :client, -> { Seed::Types::Client }, optional: true, nullable: false
      end
    end
  end
end
