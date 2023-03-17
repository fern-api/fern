import { RenderFormDialogArgs, SingleContextedFormDialogProviderRenderer } from "@fern-api/contexted-dialog";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback, useMemo, useState } from "react";
import { useAddEnvironmentToQueryCache } from "../../../../queries/useAllEnvironments";
import { useCurrentOrganizationId } from "../../../../routes/useCurrentOrganization";
import { useRegistryService } from "../../../../services/useRegistryService";
import { CreateEnvironmentForm } from "./form/CreateEnvironmentForm";
import { CreateEnvironmentFormState } from "./types";

export const INITIAL_ENVIRONMENT_FORM_STATE: CreateEnvironmentFormState = {
    environmentId: "",
    description: "",
};

interface CreatePayload extends FernRegistry.CreateEnvironmentRequest {
    organizationId: FernRegistry.OrgId;
}

export const CreateEnvironmentFormDialogProviderRenderer: SingleContextedFormDialogProviderRenderer<
    CreateEnvironmentFormState
> = ({ Provider, children }) => {
    const [state, setState] = useState<CreateEnvironmentFormState>();

    const organizationId = useCurrentOrganizationId();

    const createPayload = useMemo((): Required<CreatePayload> | undefined => {
        if (organizationId == null || state == null || state.environmentId.length === 0) {
            return undefined;
        }
        return {
            id: FernRegistry.EnvironmentId(state.environmentId),
            description: state.description,
            organizationId,
        };
    }, [organizationId, state]);

    const registryService = useRegistryService();
    const onClickCreate = useCallback(
        async ({ organizationId, ...createPayload }: CreatePayload) => {
            const response = await registryService.environment.create(organizationId, createPayload);
            if (!response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw response.error;
            }
        },
        [registryService.environment]
    );

    const renderForm = useCallback((definedState: CreateEnvironmentFormState, args: RenderFormDialogArgs) => {
        return <CreateEnvironmentForm {...args} state={definedState} setState={setState} />;
    }, []);

    const addEnvironmentToQueryCache = useAddEnvironmentToQueryCache();

    const onSucessfulCreate = useCallback(
        async (_: void, payload: FernRegistry.CreateEnvironmentRequest) => {
            await addEnvironmentToQueryCache(payload);
        },
        [addEnvironmentToQueryCache]
    );

    return (
        <Provider
            formState={state}
            setFormState={setState}
            dialogTitle="Create environment"
            createPayload={createPayload}
            onClickCreate={onClickCreate}
            errorToastText="Failed to create environment"
            renderForm={renderForm}
            onSuccessfulCreate={onSucessfulCreate}
        >
            {children}
        </Provider>
    );
};
