import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const StatusIcon = ({ isBeantwortet }) => {
  return (
    <div>
      {isBeantwortet ? (
        <Icon icon={IconNames.TICK_CIRCLE} intent="success" />
      ) : (
        <Icon icon={IconNames.CROSS} intent="danger" />
      )}
    </div>
  );
};

export default StatusIcon;
