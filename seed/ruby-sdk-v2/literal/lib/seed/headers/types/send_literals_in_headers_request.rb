
module Seed
    module Headers
        class SendLiteralsInHeadersRequest
            field :endpoint_version, String, optional: false, nullable: false
            field :async, Internal::Types::Boolean, optional: false, nullable: false
    end
end
