# frozen_string_literal: true

module Seed
  module Types
    class ClientResponse < Internal::Types::Model
      field :client, -> { Seed::Types::ClientWithID }, optional: true, nullable: false
    end
  end
end
