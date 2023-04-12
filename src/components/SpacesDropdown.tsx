import { component$, Resource, useResource$ } from '@builder.io/qwik';
import type { SpaceProps } from 'contentful-management/types';
import type { IState } from '~/routes';
import { getSpaces } from '~/contentful-migrate/space';

async function fetchSpaces() {
  const spaces = await getSpaces();
  return (
    spaces?.map((space: SpaceProps) => ({
      id: space.sys.id,
      name: space.name,
    })) || []
  );
}

export const SpacesDropdown = component$(
  ({ state, type }: { state: IState; type: 'source' | 'target' }) => {
    const spacesResource = useResource$<{ id: string; name: string }[]>(
      async () => {
        const res = await fetchSpaces();
        return res;
      }
    );

    return (
      <select
        onInput$={(event: Event) => {
          const target = event.target as HTMLSelectElement;
          state[type] = {
            spaceId: target.value,
            spaceName: target.options[target.selectedIndex].text,
            environmentId: '',
          };
        }}
      >
        {!state[type].spaceId && (
          <option value="" disabled selected>{`Select ${type} space`}</option>
        )}

        <Resource
          value={spacesResource}
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
