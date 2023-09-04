package com.seed.trace.resources.v2.v3;

import com.seed.trace.core.ClientOptions;
import com.seed.trace.core.Suppliers;
import com.seed.trace.resources.v2.v3.problem.ProblemClient;
import java.util.function.Supplier;

public class V3Client {
    protected final ClientOptions clientOptions;

    protected final Supplier<ProblemClient> problemClient;

    public V3Client(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        this.problemClient = Suppliers.memoize(() -> new ProblemClient(clientOptions));
    }

    public ProblemClient problem() {
        return this.problemClient.get();
    }
}
