import { component$, Resource, useResource$ } from '@builder.io/qwik';
import type { EnvironmentProps } from 'contentful-management/types';
import type { IState } from '~/routes';
import { getEnvironments } from '~/contentful-migrate/space';
import { server$ } from '@builder.io/qwik-city';

export const fetchEnvironments = server$(async (spaceId: string) => {
  const environments = await getEnvironments({ spaceId });
  return (
    environments?.map((environment: EnvironmentProps) => ({
      id: environment.sys.id,
      name: environment.name,
    })) || []
  );
});

export default component$(
  ({ state, type }: { state: IState; type: 'source' | 'target' }) => {
    const environmentsResource = useResource$<{ id: string; name: string }[]>(
      async ({ track }) => {
        const spaceId = track(() => state[type].spaceId);
        if (!state[type].spaceId) return [];

        const res = await fetchEnvironments(spaceId);
        return res;
      }
    );

    return (
      <select
        onInput$={(event: Event) => {
          const environmentId = (event.target as HTMLSelectElement).value;
          state[type].environmentId = environmentId;
        }}
        disabled={!state[type].spaceId}
      >
        {!state[type].environmentId && (
          <option
            value=""
            disabled
            selected
          >{`Select ${type} environment`}</option>
        )}
        <Resource
          value={environmentsResource}
          onResolved={(value) => {
            const options = value.map((space) => (
              <option value={space.id} key={space.id}>
                {space.name}
              </option>
            ));
            return <>{options}</>;
          }}
          onPending={() => <option>Loading...</option>}
        />
      </select>
    );
  }
);
