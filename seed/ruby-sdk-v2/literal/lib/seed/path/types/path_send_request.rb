# frozen_string_literal: true

module Seed
  module Path
    module Types
      class PathSendRequest < Internal::Types::Model
        field :id, -> { Seed::Path::Types::PathSendRequestID }, optional: false, nullable: false
      end
    end
  end
end
