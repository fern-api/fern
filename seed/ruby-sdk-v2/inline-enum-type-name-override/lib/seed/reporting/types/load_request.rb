# frozen_string_literal: true

module Seed
  module Reporting
    module Types
      class LoadRequest < Internal::Types::Model
        field :cache, -> { Seed::Reporting::Types::LoadRequestCache }, optional: true, nullable: false

        field :status, -> { Seed::Reporting::Types::LoadRequestStatus }, optional: true, nullable: false
      end
    end
  end
end
