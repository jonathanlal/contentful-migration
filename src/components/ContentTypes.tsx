import { component$, Resource, useResource$ } from '@builder.io/qwik';
import type { ContentTypeProps } from 'contentful-management/types';
import type { IState } from '~/routes';
import { getAllContentTypes } from '~/contentful-migrate/model';

async function fetchContentTypes(spaceId: string, environmentId: string) {
  const contentTypes = await getAllContentTypes({
    spaceId,
    environmentId,
  });
  return contentTypes
    .sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    .map((type: ContentTypeProps) => ({
      id: type.sys.id,
      name: type.name,
    }));
}

export const ContentTypesDropdown = component$(
  ({ state }: { state: IState }) => {
    const contentTypesResource = useResource$<{ id: string; name: string }[]>(
      async ({ track }) => {
        const sourceSpaceId = track(() => state.source.spaceId);
        const sourceEnvironmentId = track(
          () => state.source.environmentId || ''
        );
        const targetSpaceId = track(() => state.target.spaceId);
        const targetEnvironmentId = track(
          () => state.target.environmentId || ''
        );

        if (
          !sourceSpaceId ||
          !sourceEnvironmentId ||
          !targetSpaceId ||
          !targetEnvironmentId
        )
          return [];
        const res = await fetchContentTypes(sourceSpaceId, sourceEnvironmentId);
        return res;
      }
    );

    const isDisabled =
      !state.source.spaceId ||
      !state.source.environmentId ||
      !state.target.spaceId ||
      !state.target.environmentId;
    return (
      <>
        {' '}
        <h2
          style={{
            margin: 0,
          }}
        >
          Content type:
        </h2>
        <select
          onInput$={(event: Event) => {
            const contentTypeId = (event.target as HTMLSelectElement).value;
            state.contentType = contentTypeId;
          }}
          disabled={isDisabled}
        >
          {(isDisabled || !state.contentType) && (
            <option value="" disabled selected>{`Select content type`}</option>
          )}
          <Resource
            value={contentTypesResource}
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
      </>
    );
  }
);
