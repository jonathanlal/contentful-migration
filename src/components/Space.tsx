import { component$ } from '@builder.io/qwik';
import type { IState } from '~/routes';
import EnvironmentsDropdown from './EnvironmentsSpaces';
import { SpacesDropdown } from './SpacesDropdown';

export const Space = component$(
  ({ state, type }: { state: IState; type: 'source' | 'target' }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          {type}:
        </h2>
        <SpacesDropdown state={state} type={type} />
        <EnvironmentsDropdown state={state} type={type} />
      </div>
    );
  }
);
