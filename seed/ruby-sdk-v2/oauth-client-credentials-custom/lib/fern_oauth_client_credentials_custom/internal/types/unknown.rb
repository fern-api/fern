# frozen_string_literal: true

module FernOauthClientCredentialsCustom
  module Internal
    module Types
      module Unknown
        include FernOauthClientCredentialsCustom::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
